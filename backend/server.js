const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { OAuth2Client } = require("google-auth-library");

const connectDB = require("./db");
const User = require("./models/user");
const Doctor = require("./models/doctor");
const Appointment = require("./models/appointment");
const SupportMessage = require("./models/support");
const { seedDatabase } = require("./seedDoctors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const IS_PROD = process.env.NODE_ENV === "production";
const JWT_SECRET =
  process.env.JWT_SECRET &&
  process.env.JWT_SECRET !== "YOUR_LONG_RANDOM_PRIVATE_SECRET" &&
  !process.env.JWT_SECRET.startsWith("replace_with")
    ? process.env.JWT_SECRET
    : "medicare_dev_fallback_secret_change_in_prod_2026";

if (IS_PROD && JWT_SECRET === "medicare_dev_fallback_secret_change_in_prod_2026") {
  console.error("FATAL: set a strong JWT_SECRET environment variable in production.");
  process.exit(1);
}
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const ALLOW_DEMO_VERIFY = process.env.ALLOW_DEMO_VERIFY !== "false";

function isGoogleOAuthConfigured() {
  return (
    Boolean(GOOGLE_CLIENT_ID) &&
    GOOGLE_CLIENT_ID.includes(".apps.googleusercontent.com") &&
    !GOOGLE_CLIENT_ID.startsWith("YOUR_")
  );
}

const googleClient = isGoogleOAuthConfigured()
  ? new OAuth2Client(GOOGLE_CLIENT_ID)
  : null;

// ======================================
// MIDDLEWARE
// ======================================

const configuredOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  ...configuredOrigins,
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      if (origin.endsWith(".vercel.app") || origin.endsWith(".netlify.app") || origin.endsWith(".onrender.com")) {
        return callback(null, true);
      }
      // Dev stays open; production only accepts listed / known-host origins.
      return callback(null, !IS_PROD);
    },
    credentials: true,
  })
);
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
app.use(express.json({ limit: "1mb" }));

function rateLimit({ windowMs, max, message }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
  }, windowMs).unref();
  return (req, res, next) => {
    const key = req.ip + ":" + req.path;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset <= now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.reset - now) / 1000));
      return res.status(429).json({ success: false, message });
    }
    next();
  };
}
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: "Too many attempts. Please wait a few minutes and try again." });
const chatLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: "You are sending messages too quickly. Please slow down." });
app.use(["/api/login", "/api/register", "/api/auth/google"], authLimiter);
app.use(["/api/chat", "/api/support"], chatLimiter);

// AUTHENTICATION HELPERS
// ======================================

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role || "patient",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function getUserData(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "patient",
    doctorVerificationStatus: user.doctorVerificationStatus || "not_required",
    authProvider: user.authProvider || "local",
    avatar: user.avatar || "",
    phone: user.phone || "",
    age: user.age ?? null,
    gender: user.gender || "",
    bloodGroup: user.bloodGroup || "",
    allergies: user.allergies || "",
    emergencyContact: user.emergencyContact || "",
    healthMetrics: user.healthMetrics || {},
    healthRecords: user.healthRecords || [],
  };
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please login.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found. Please login again.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch {
    // Guest fallback
  }
  next();
}

function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource.",
      });
    }

    next();
  };
}

function requireApprovedDoctor(req, res, next) {
  if (
    req.user.role !== "doctor" ||
    req.user.doctorVerificationStatus !== "approved"
  ) {
    return res.status(403).json({
      success: false,
      message: "Your doctor account must be approved first.",
    });
  }

  next();
}

function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function validateDateAndTime(date, time) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "Invalid appointment date.";
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return "Invalid appointment date.";
  }

  if (date < getTodayDateString()) {
    return "Please select today or a future date.";
  }

  if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) {
    return "Invalid appointment time.";
  }

  const [hours, minutes] = time.split(":").map(Number);
  if (hours > 23 || minutes > 59) {
    return "Invalid appointment time.";
  }

  return null;
}

// ======================================
// HEALTH & CONFIG ROUTES
// ======================================

app.get("/api/health", async (req, res) => {
  try {
    const dbReady = mongoose.connection.readyState === 1;
    const doctorCount = dbReady ? await Doctor.countDocuments({ isAvailable: true }) : 0;

    res.json({
      success: true,
      message: "MediCare Backend is running successfully!",
      database: dbReady ? "connected" : "disconnected",
      doctorCount,
      googleOAuthEnabled: isGoogleOAuthConfigured(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      demoVerifyEnabled: ALLOW_DEMO_VERIFY,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/auth/config", (req, res) => {
  res.json({
    success: true,
    googleEnabled: isGoogleOAuthConfigured(),
    googleClientId: isGoogleOAuthConfigured() ? GOOGLE_CLIENT_ID : null,
    demoVerifyEnabled: ALLOW_DEMO_VERIFY,
  });
});

// ======================================
// REGISTER
// ======================================

app.post("/api/register", async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const role = req.body.role || "patient";

    const specialty = req.body.specialty?.trim();
    const location = req.body.location?.trim();
    const experience = req.body.experience?.trim();
    const qualification = req.body.qualification?.trim();
    const consultationFee = Number(req.body.consultationFee);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account role.",
      });
    }

    if (name.length < 2 || name.length > 100 || email.length > 254) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid name and email details.",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (role === "doctor" && (!specialty || !location)) {
      return res.status(400).json({
        success: false,
        message: "Doctor specialty and location are required.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      doctorVerificationStatus: role === "doctor" ? "pending" : "not_required",
      authProvider: "local",
    });

    let doctorProfile = null;
    if (role === "doctor") {
      doctorProfile = await Doctor.create({
        userId: user._id,
        name,
        specialty,
        location,
        experience: experience || "Not specified",
        qualification: qualification || "MBBS, MD",
        consultationFee:
          Number.isFinite(consultationFee) && consultationFee >= 0
            ? consultationFee
            : 600,
        isAvailable: false,
      });
    }

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message:
        role === "doctor"
          ? "Doctor account created. Verification is pending."
          : "Patient registration successful!",
      token,
      user: getUserData(user),
      doctorProfile,
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
});

// ======================================
// EMAIL AND PASSWORD LOGIN
// ======================================

app.post("/api/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message:
          user && user.authProvider === "google"
            ? "This account uses Google Sign-In. Please continue with Google."
            : "Invalid email or password.",
      });
    }

    const isBcryptHash = /^\$2[aby]\$/.test(user.password);
    let passwordMatches = false;

    if (isBcryptHash) {
      passwordMatches = await bcrypt.compare(password, user.password);
    } else {
      passwordMatches = user.password === password;
      if (passwordMatches) {
        user.password = await bcrypt.hash(password, 12);
        await user.save();
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);
    const doctorProfile =
      user.role === "doctor"
        ? await Doctor.findOne({ userId: user._id })
        : null;

    return res.json({
      success: true,
      message: "Login successful!",
      token,
      user: getUserData(user),
      doctorProfile,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
});

// ======================================
// GOOGLE SIGN-IN (ID TOKEN OR ACCESS TOKEN)
// ======================================

app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential, accessToken, role: requestedRole } = req.body;

    if (!isGoogleOAuthConfigured() || !googleClient) {
      return res.status(503).json({
        success: false,
        message:
          "Google OAuth Client ID is not configured on the server yet. Set a valid *.apps.googleusercontent.com GOOGLE_CLIENT_ID in backend/.env.",
      });
    }

    if (!credential && !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    let googlePayload = null;

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      googlePayload = ticket.getPayload();
    } else if (accessToken) {
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (userInfoResponse.ok) {
        googlePayload = await userInfoResponse.json();
      }
    }

    if (
      !googlePayload ||
      !googlePayload.sub ||
      !googlePayload.email ||
      googlePayload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account could not be verified.",
      });
    }

    const email = googlePayload.email.trim().toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      const role = requestedRole === "doctor" ? "doctor" : "patient";
      user = await User.create({
        name: googlePayload.name || "MediCare User",
        email,
        password: null,
        googleId: googlePayload.sub,
        avatar: googlePayload.picture || "",
        role,
        doctorVerificationStatus:
          role === "doctor" ? "pending" : "not_required",
        authProvider: "google",
      });

      if (role === "doctor") {
        await Doctor.create({
          userId: user._id,
          name: user.name,
          specialty: "General Medicine",
          location: "New Delhi",
          experience: "Not specified",
          image: googlePayload.picture || "",
          isAvailable: false,
        });
      }
    } else if (user.googleId && user.googleId !== googlePayload.sub) {
      return res.status(409).json({
        success: false,
        message: "This email is linked to another Google account.",
      });
    } else {
      let dirty = false;
      if (!user.googleId) {
        user.googleId = googlePayload.sub;
        dirty = true;
      }
      if (!user.avatar && googlePayload.picture) {
        user.avatar = googlePayload.picture;
        dirty = true;
      }
      if (dirty) await user.save();
    }

    const token = createToken(user);
    const doctorProfile =
      user.role === "doctor"
        ? await Doctor.findOne({ userId: user._id })
        : null;

    return res.json({
      success: true,
      message: "Google login successful!",
      token,
      user: getUserData(user),
      doctorProfile,
    });
  } catch (error) {
    console.error("Google authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed.",
    });
  }
});

// ======================================
// GET LOGGED-IN USER & PROFILE MANAGEMENT
// ======================================

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  const doctorProfile =
    req.user.role === "doctor"
      ? await Doctor.findOne({ userId: req.user._id })
      : null;

  return res.json({
    success: true,
    user: getUserData(req.user),
    doctorProfile,
  });
});

app.get("/api/profile", authenticateToken, async (req, res) => {
  return res.json({
    success: true,
    user: getUserData(req.user),
  });
});

app.patch("/api/profile", authenticateToken, async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "age",
      "gender",
      "bloodGroup",
      "allergies",
      "emergencyContact",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "age") {
          const parsedAge = req.body.age === "" || req.body.age === null ? null : Number(req.body.age);
          if (parsedAge !== null && (!Number.isFinite(parsedAge) || parsedAge < 0 || parsedAge > 130)) {
            return res.status(400).json({
              success: false,
              message: "Please enter a valid age.",
            });
          }
          req.user.age = parsedAge;
        } else if (field === "name") {
          const trimmed = String(req.body.name).trim();
          if (trimmed.length < 2) {
            return res.status(400).json({
              success: false,
              message: "Name must be at least 2 characters.",
            });
          }
          req.user.name = trimmed;
        } else {
          req.user[field] = String(req.body[field]).trim();
        }
      }
    }

    if (req.body.healthMetrics && typeof req.body.healthMetrics === "object") {
      const m = req.body.healthMetrics;
      req.user.healthMetrics = {
        bloodPressure: m.bloodPressure ?? req.user.healthMetrics?.bloodPressure ?? "",
        heartRate: m.heartRate ?? req.user.healthMetrics?.heartRate ?? "",
        bloodSugar: m.bloodSugar ?? req.user.healthMetrics?.bloodSugar ?? "",
        weight: m.weight ?? req.user.healthMetrics?.weight ?? "",
        height: m.height ?? req.user.healthMetrics?.height ?? "",
        updatedAt: new Date(),
      };
    }

    await req.user.save();

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: getUserData(req.user),
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update profile.",
    });
  }
});

app.post("/api/health-records", authenticateToken, async (req, res) => {
  try {
    const title = req.body.title?.trim();
    const category = req.body.category || "Checkup";
    const date = req.body.date || getTodayDateString();
    const provider = req.body.provider?.trim() || "MediCare Clinic";
    const summary = req.body.summary?.trim() || "";

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Record title is required.",
      });
    }

    req.user.healthRecords.unshift({
      title,
      category,
      date,
      provider,
      summary,
    });

    await req.user.save();

    return res.status(201).json({
      success: true,
      message: "Health record added.",
      healthRecords: req.user.healthRecords,
      user: getUserData(req.user),
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to save health record.",
    });
  }
});

app.delete("/api/health-records/:recordId", authenticateToken, async (req, res) => {
  try {
    const beforeCount = req.user.healthRecords.length;
    req.user.healthRecords = req.user.healthRecords.filter(
      (rec) => rec._id.toString() !== req.params.recordId
    );

    if (req.user.healthRecords.length === beforeCount) {
      return res.status(404).json({
        success: false,
        message: "Health record not found.",
      });
    }

    await req.user.save();

    return res.json({
      success: true,
      message: "Health record removed.",
      healthRecords: req.user.healthRecords,
      user: getUserData(req.user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete health record.",
    });
  }
});

// ======================================
// DOCTORS & SLOT AVAILABILITY
// ======================================

app.get("/api/doctors", async (req, res) => {
  try {
    const query = { isAvailable: true };

    if (req.query.specialty && req.query.specialty !== "All") {
      query.specialty = new RegExp(req.query.specialty.trim(), "i");
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), "i");
      query.$or = [{ name: regex }, { specialty: regex }, { location: regex }];
    }

    const doctors = await Doctor.find(query)
      .select(
        "name specialty qualification experience rating consultationFee location bio languages availableSlots image isAvailable"
      )
      .sort({ rating: -1, createdAt: 1 });

    return res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.error("Fetch doctors error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch doctors.",
    });
  }
});

app.get("/api/doctors/:id/slots", async (req, res) => {
  try {
    const { id } = req.params;
    const date = req.query.date;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    const baseSlots =
      doctor.availableSlots && doctor.availableSlots.length > 0
        ? doctor.availableSlots
        : [
            "09:00",
            "10:00",
            "11:00",
            "12:00",
            "14:00",
            "15:00",
            "16:00",
            "17:00",
          ];

    let bookedTimes = new Set();
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const existing = await Appointment.find({
        doctor: doctor._id,
        date,
        status: { $in: ["pending", "approved"] },
      }).select("time");
      bookedTimes = new Set(existing.map((a) => a.time));
    }

    return res.json({
      success: true,
      slots: baseSlots.map((time) => ({
        time,
        available: !bookedTimes.has(time),
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to check doctor availability.",
    });
  }
});

// ======================================
// PATIENT: BOOK, VIEW, CANCEL, RESCHEDULE APPOINTMENTS
// ======================================

app.post(
  "/api/appointments",
  authenticateToken,
  allowRoles("patient"),
  async (req, res) => {
    try {
      const {
        doctorId,
        date,
        time,
        reason = "",
        type = "In-Person",
      } = req.body;

      if (!doctorId || !date || !time) {
        return res.status(400).json({
          success: false,
          message: "Doctor, date and time are required.",
        });
      }

      if (!mongoose.isValidObjectId(doctorId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor selected.",
        });
      }

      const dateError = validateDateAndTime(date, time);
      if (dateError) {
        return res.status(400).json({
          success: false,
          message: dateError,
        });
      }

      if (typeof reason !== "string" || reason.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Reason must be 500 characters or fewer.",
        });
      }

      const appointmentType = ["In-Person", "Video Consultation"].includes(type)
        ? type
        : "In-Person";

      const doctor = await Doctor.findOne({
        _id: doctorId,
        isAvailable: true,
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found or currently unavailable.",
        });
      }

      const doctorUser = await User.findById(doctor.userId);
      if (doctorUser && doctorUser.doctorVerificationStatus !== "approved") {
        return res.status(403).json({
          success: false,
          message: "This doctor is not approved for appointments.",
        });
      }

      const conflict = await Appointment.findOne({
        doctor: doctor._id,
        date,
        time,
        status: { $in: ["pending", "approved"] },
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "This doctor's time slot is already booked.",
        });
      }

      const appointment = await Appointment.create({
        patient: req.user._id,
        doctor: doctor._id,
        date,
        time,
        type: appointmentType,
        reason: reason.trim(),
        status: "pending",
      });

      const populatedAppointment = await Appointment.findById(
        appointment._id
      ).populate(
        "doctor",
        "name specialty qualification experience rating consultationFee location image"
      );

      return res.status(201).json({
        success: true,
        message: "Appointment request submitted successfully!",
        appointment: populatedAppointment,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "This doctor's time slot is already booked.",
        });
      }

      console.error("Book appointment error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to book appointment.",
      });
    }
  }
);

app.get(
  "/api/appointments/my",
  authenticateToken,
  allowRoles("patient"),
  async (req, res) => {
    try {
      const appointments = await Appointment.find({
        patient: req.user._id,
      })
        .populate(
          "doctor",
          "name specialty qualification experience rating consultationFee location image"
        )
        .sort({ date: -1, time: 1 });

      return res.json({
        success: true,
        appointments,
      });
    } catch (error) {
      console.error("Fetch patient appointments error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch appointments.",
      });
    }
  }
);

app.patch(
  "/api/appointments/:id/cancel",
  authenticateToken,
  allowRoles("patient"),
  async (req, res) => {
    try {
      const appointment = await Appointment.findOne({
        _id: req.params.id,
        patient: req.user._id,
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found.",
        });
      }

      if (!["pending", "approved"].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel an appointment that is already ${appointment.status}.`,
        });
      }

      appointment.status = "cancelled";
      await appointment.save();

      return res.json({
        success: true,
        message: "Appointment cancelled successfully.",
        appointment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to cancel appointment.",
      });
    }
  }
);

app.patch(
  "/api/appointments/:id/reschedule",
  authenticateToken,
  allowRoles("patient"),
  async (req, res) => {
    try {
      const { date, time } = req.body;
      const dateError = validateDateAndTime(date, time);
      if (dateError) {
        return res.status(400).json({ success: false, message: dateError });
      }

      const appointment = await Appointment.findOne({
        _id: req.params.id,
        patient: req.user._id,
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found.",
        });
      }

      if (!["pending", "approved"].includes(appointment.status)) {
        return res.status(400).json({
          success: false,
          message: "Only pending or approved appointments can be rescheduled.",
        });
      }

      const conflict = await Appointment.findOne({
        _id: { $ne: appointment._id },
        doctor: appointment.doctor,
        date,
        time,
        status: { $in: ["pending", "approved"] },
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: "Selected slot is already booked.",
        });
      }

      appointment.date = date;
      appointment.time = time;
      appointment.status = "pending";
      await appointment.save();

      const populated = await Appointment.findById(appointment._id).populate(
        "doctor",
        "name specialty qualification experience rating consultationFee location image"
      );

      return res.json({
        success: true,
        message: "Appointment rescheduled successfully.",
        appointment: populated,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Selected slot is already booked.",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Unable to reschedule appointment.",
      });
    }
  }
);

// ======================================
// DOCTOR ROUTES
// ======================================

app.post(
  "/api/doctor/verify-demo",
  authenticateToken,
  allowRoles("doctor"),
  async (req, res) => {
    try {
      if (!ALLOW_DEMO_VERIFY) {
        return res.status(403).json({
          success: false,
          message: "Instant demo verification is disabled.",
        });
      }

      req.user.doctorVerificationStatus = "approved";
      await req.user.save();

      const doctorProfile = await Doctor.findOneAndUpdate(
        { userId: req.user._id },
        { isAvailable: true },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Doctor account verified and listed as available!",
        user: getUserData(req.user),
        doctorProfile,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to verify doctor account.",
      });
    }
  }
);

app.get(
  "/api/doctor/profile",
  authenticateToken,
  allowRoles("doctor"),
  async (req, res) => {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }
    return res.json({ success: true, doctor });
  }
);

app.patch(
  "/api/doctor/profile",
  authenticateToken,
  allowRoles("doctor"),
  async (req, res) => {
    try {
      const updates = {};
      const stringFields = [
        "name",
        "specialty",
        "qualification",
        "experience",
        "location",
        "bio",
      ];

      for (const field of stringFields) {
        if (req.body[field] !== undefined) {
          updates[field] = String(req.body[field]).trim();
        }
      }

      if (req.body.consultationFee !== undefined) {
        const fee = Number(req.body.consultationFee);
        if (Number.isFinite(fee) && fee >= 0) {
          updates.consultationFee = fee;
        }
      }

      if (typeof req.body.isAvailable === "boolean") {
        updates.isAvailable = req.body.isAvailable;
      }

      if (updates.name) {
        req.user.name = updates.name;
        await req.user.save();
      }

      const doctor = await Doctor.findOneAndUpdate(
        { userId: req.user._id },
        updates,
        { new: true, runValidators: true }
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found.",
        });
      }

      return res.json({
        success: true,
        message: "Doctor profile updated.",
        doctor,
        user: getUserData(req.user),
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Unable to update doctor profile.",
      });
    }
  }
);

app.get(
  "/api/doctor/appointments",
  authenticateToken,
  allowRoles("doctor"),
  requireApprovedDoctor,
  async (req, res) => {
    try {
      const doctor = await Doctor.findOne({ userId: req.user._id });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found.",
        });
      }

      const appointments = await Appointment.find({
        doctor: doctor._id,
      })
        .populate("patient", "name email phone age gender bloodGroup allergies")
        .sort({ date: -1, time: 1 });

      return res.json({
        success: true,
        appointments,
        doctor,
      });
    } catch (error) {
      console.error("Fetch doctor appointments error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch doctor appointments.",
      });
    }
  }
);

app.patch(
  "/api/doctor/appointments/:id",
  authenticateToken,
  allowRoles("doctor"),
  requireApprovedDoctor,
  async (req, res) => {
    try {
      const { status, notes, prescription } = req.body;

      if (status && !["approved", "rejected", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment status.",
        });
      }

      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found.",
        });
      }

      const appointment = await Appointment.findOne({
        _id: req.params.id,
        doctor: doctor._id,
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found.",
        });
      }

      if (status) {
        appointment.status = status;
      }

      if (typeof notes === "string") {
        appointment.notes = notes.trim();
      }

      if (prescription && typeof prescription === "object") {
        const meds = Array.isArray(prescription.medications)
          ? prescription.medications
              .filter((m) => m && m.name && m.dosage)
              .map((m) => ({
                name: String(m.name).trim(),
                dosage: String(m.dosage).trim(),
                duration: String(m.duration || "5 days").trim(),
                instructions: String(m.instructions || "After meals").trim(),
              }))
          : [];

        appointment.prescription = {
          medications: meds,
          advice: String(prescription.advice || "").trim(),
          issuedAt: new Date(),
        };
      }

      await appointment.save();

      const updated = await Appointment.findById(appointment._id).populate(
        "patient",
        "name email phone age gender bloodGroup allergies"
      );

      return res.json({
        success: true,
        message: "Appointment updated successfully.",
        appointment: updated,
      });
    } catch (error) {
      console.error("Update appointment error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to update appointment.",
      });
    }
  }
);

app.patch(
  "/api/doctor/availability",
  authenticateToken,
  allowRoles("doctor"),
  requireApprovedDoctor,
  async (req, res) => {
    try {
      if (typeof req.body.isAvailable !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isAvailable must be true or false.",
        });
      }

      const doctor = await Doctor.findOneAndUpdate(
        { userId: req.user._id },
        { isAvailable: req.body.isAvailable },
        { new: true, runValidators: true }
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found.",
        });
      }

      return res.json({
        success: true,
        message: "Availability updated.",
        doctor,
      });
    } catch (error) {
      console.error("Update availability error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to update availability.",
      });
    }
  }
);

// ======================================
// SUPPORT & CONTACT MESSAGES
// ======================================

app.post("/api/support", optionalAuth, async (req, res) => {
  try {
    const name = req.body.name?.trim() || req.user?.name || "Visitor";
    const email = req.body.email?.trim().toLowerCase() || req.user?.email;
    const subject = req.body.subject?.trim() || "General Inquiry";
    const message = req.body.message?.trim();

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: "Email and message are required.",
      });
    }

    const ticket = await SupportMessage.create({
      userId: req.user?._id || null,
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been received. Our care team will reply soon!",
      ticketId: ticket._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to submit your message right now.",
    });
  }
});

// ======================================
// MEDICARE AI CHAT â€” GEMINI + INTELLIGENT FALLBACK
// ======================================

function buildSmartFallbackReply(rawMessage, doctorsList = [], isHindi = false) {
  const lower = rawMessage.toLowerCase();

  if (
    /\b(chest pain|can't breathe|cannot breathe|not breathing|unconscious|severe bleeding|heart attack|stroke|suicid)\b/.test(
      lower
    )
  ) {
    return isHindi
      ? "à¤¯à¤¹ à¤à¤• à¤®à¥‡à¤¡à¤¿à¤•à¤² à¤‡à¤®à¤°à¤œà¥‡à¤‚à¤¸à¥€ à¤¹à¥‹ à¤¸à¤•à¤¤à¥€ à¤¹à¥ˆà¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤‘à¤¨à¤²à¤¾à¤‡à¤¨ à¤œà¤µà¤¾à¤¬ à¤•à¤¾ à¤‡à¤‚à¤¤à¤œà¤¼à¤¾à¤° à¤¨ à¤•à¤°à¥‡à¤‚â€”à¤¤à¥à¤°à¤‚à¤¤ 112 à¤ªà¤° à¤•à¥‰à¤² à¤•à¤°à¥‡à¤‚ à¤¯à¤¾ à¤¨à¤œà¤¦à¥€à¤•à¥€ à¤‡à¤®à¤°à¤œà¥‡à¤‚à¤¸à¥€ à¤…à¤¸à¥à¤ªà¤¤à¤¾à¤² à¤œà¤¾à¤à¤‚à¥¤"
      : "âš ï¸ This may be a medical emergency. Please do not wait for an online replyâ€”call 112 (or your local emergency number) or visit the nearest emergency department immediately.";
  }

  if (/\b(book|appointment|schedule|slot|visit|consult)\b/.test(lower)) {
    return isHindi
      ? "à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ 'Book an Appointment' à¤ªà¤° à¤œà¤¾à¤à¤‚, à¤…à¤ªà¤¨à¥€ à¤ªà¤¸à¤‚à¤¦ à¤•à¤¾ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤”à¤° à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¸à¤®à¤¯ à¤šà¥à¤¨à¥‡à¤‚, à¤”à¤° à¤•à¤¨à¥à¤«à¤°à¥à¤® à¤•à¤°à¥‡à¤‚à¥¤ à¤†à¤ª à¤¡à¥ˆà¤¶à¤¬à¥‹à¤°à¥à¤¡ à¤¸à¥‡ à¤…à¤ªà¤¨à¥‡ à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤•à¥‹ à¤°à¥€à¤¶à¥‡à¤¡à¥à¤¯à¥‚à¤² à¤¯à¤¾ à¤•à¥ˆà¤‚à¤¸à¤¿à¤² à¤­à¥€ à¤•à¤° à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤"
      : "You can book a consultation in seconds: click 'Book an Appointment', choose your preferred specialist, select an available date & time slot (In-Person or Video), and submit. You can also manage, reschedule, or cancel bookings from your Patient Dashboard.";
  }

  if (/\b(doctor|specialist|cardiolog|dermatolog|neurolog|pediatric|orthopedic|general)\b/.test(lower)) {
    const sample = doctorsList
      .slice(0, 4)
      .map((d) => `â€¢ ${d.name} (${d.specialty}, ${d.location} â€” â‚¹${d.consultationFee || 600})`)
      .join("\n");
    return sample
      ? `Here are some specialists currently available on MediCare:\n${sample}\n\nClick any specialist card in 'Find Doctors' to view available time slots.`
      : "You can browse all verified specialists by department in the 'Find Doctors' section on the homepage or inside the Appointment Booking portal.";
  }

  if (/\b(fever|headache|cold|cough|flu|stomach|pain|migraine|allergy|rash|sleep)\b/.test(lower)) {
    return isHindi
      ? "à¤¹à¤²à¥à¤•à¥‡ à¤²à¤•à¥à¤·à¤£à¥‹à¤‚ à¤•à¥‡ à¤²à¤¿à¤ à¤†à¤°à¤¾à¤® à¤•à¤°à¥‡à¤‚, à¤ªà¤°à¥à¤¯à¤¾à¤ªà¥à¤¤ à¤ªà¤¾à¤¨à¥€ à¤ªà¤¿à¤à¤‚, à¤”à¤° à¤¤à¤¾à¤ªà¤®à¤¾à¤¨ à¤ªà¤° à¤¨à¤œà¤¼à¤° à¤°à¤–à¥‡à¤‚à¥¤ à¤®à¥ˆà¤‚ à¤¬à¥€à¤®à¤¾à¤°à¥€ à¤•à¤¾ à¤¨à¤¿à¤¦à¤¾à¤¨ à¤¯à¤¾ à¤¦à¤µà¤¾ à¤¨à¤¹à¥€à¤‚ à¤²à¤¿à¤– à¤¸à¤•à¤¤à¤¾à¥¤ à¤¯à¤¦à¤¿ à¤¬à¥à¤–à¤¾à¤° à¤¤à¥‡à¤œ à¤¹à¥‹, à¤²à¤—à¤¾à¤¤à¤¾à¤° à¤¬à¤¨à¤¾ à¤°à¤¹à¥‡, à¤¯à¤¾ à¤…à¤¨à¥à¤¯ à¤—à¤‚à¤­à¥€à¤° à¤²à¤•à¥à¤·à¤£ à¤¹à¥‹à¤‚, à¤¤à¥‹ à¤•à¥ƒà¤ªà¤¯à¤¾ MediCare à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤²à¥‡à¤‚à¥¤"
      : "I understand you're experiencing discomfort. For mild symptoms, rest, stay well hydrated, and monitor how you feel. Because I cannot diagnose conditions or prescribe medications, please book a consultation with a General Medicine physician or relevant specialist on MediCare if symptoms persist or worsen.";
  }

  if (/\b(hello|hi|hey|namaste|good morning|good evening)\b/.test(lower)) {
    return isHindi
      ? "à¤¨à¤®à¤¸à¥à¤¤à¥‡! MediCare AI à¤®à¥‡à¤‚ à¤†à¤ªà¤•à¤¾ à¤¸à¥à¤µà¤¾à¤—à¤¤ à¤¹à¥ˆà¥¤ à¤®à¥ˆà¤‚ à¤†à¤ªà¤•à¥‹ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤–à¥‹à¤œà¤¨à¥‡, à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤¬à¥à¤• à¤•à¤°à¤¨à¥‡ à¤¯à¤¾ à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯ à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤¦à¥‡à¤¨à¥‡ à¤®à¥‡à¤‚ à¤®à¤¦à¤¦ à¤•à¤° à¤¸à¤•à¤¤à¤¾ à¤¹à¥‚à¤à¥¤"
      : "Hello! Welcome to MediCare AI. I can help you explore specialties, find available doctors, guide you through booking an appointment, or share general wellness information. How can I help today?";
  }

  return isHindi
    ? "MediCare AI à¤¸à¥‡ à¤ªà¥‚à¤›à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦à¥¤ à¤†à¤ª à¤®à¥à¤à¤¸à¥‡ à¤¡à¥‰à¤•à¥à¤Ÿà¤°à¥‹à¤‚, à¤µà¤¿à¤­à¤¾à¤—à¥‹à¤‚, à¤…à¤ªà¥‰à¤‡à¤‚à¤Ÿà¤®à¥‡à¤‚à¤Ÿ à¤¬à¥à¤•à¤¿à¤‚à¤— à¤¯à¤¾ à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯ à¤¸à¥à¤µà¤¾à¤¸à¥à¤¥à¥à¤¯ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤ªà¥‚à¤› à¤¸à¤•à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤µà¥à¤¯à¤•à¥à¤¤à¤¿à¤—à¤¤ à¤šà¤¿à¤•à¤¿à¤¤à¥à¤¸à¤¾ à¤¸à¤²à¤¾à¤¹ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¯à¥‹à¤—à¥à¤¯ à¤¡à¥‰à¤•à¥à¤Ÿà¤° à¤¸à¥‡ à¤®à¤¿à¤²à¥‡à¤‚à¥¤"
    : "Thanks for reaching out to MediCare AI! You can ask me about finding a specialist, booking or rescheduling an appointment, clinic consultation types, or general wellness topics. For personal medical advice or diagnosis, please book a visit with one of our qualified doctors.";
}

app.post("/api/chat", optionalAuth, async (req, res) => {
  try {
    const { message, language } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    const cleanMessage = message.trim().slice(0, 2000);
    const isHindi =
      language === "hi" || cleanMessage.startsWith("Please reply in Hindi:");

    // Immediate emergency check regardless of AI provider
    if (
      /\b(chest pain|can't breathe|cannot breathe|not breathing|unconscious|severe bleeding|heart attack|stroke)\b/i.test(
        cleanMessage
      )
    ) {
      const emergencyReply = buildSmartFallbackReply(cleanMessage, [], isHindi);
      return res.json({
        success: true,
        reply: emergencyReply,
        response: emergencyReply,
        source: "safety-guard",
      });
    }

    const doctorsList = await Doctor.find({ isAvailable: true })
      .select("name specialty location consultationFee")
      .limit(8)
      .lean();

    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const doctorSummary = doctorsList
          .map((d) => `${d.name} (${d.specialty}, ${d.location})`)
          .join("; ");

        const result = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
          contents: cleanMessage,
          config: {
            systemInstruction: `
              You are MediCare AI, a friendly, concise healthcare platform assistant.
              ${req.user ? `The user's name is ${req.user.name} (${req.user.role}).` : ""}
              Available MediCare doctors right now: ${doctorSummary || "Multiple specialists available"}.
              Explain general health topics in simple, supportive language.
              Never claim to diagnose a disease or prescribe medication doses.
              Encourage consulting a qualified healthcare professional for personal medical concerns.
              For urgent/emergency symptoms, advise seeking immediate emergency help (112 in India).
            `,
          },
        });

        if (result?.text) {
          return res.json({
            success: true,
            reply: result.text,
            response: result.text,
            source: "gemini",
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini unavailable, using smart assistant fallback:", geminiErr.message);
      }
    }

    const fallbackReply = buildSmartFallbackReply(cleanMessage, doctorsList, isHindi);
    return res.json({
      success: true,
      reply: fallbackReply,
      response: fallbackReply,
      source: "assistant",
    });
  } catch (error) {
    console.error("MediCare chat error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to process your message right now.",
    });
  }
});

// ======================================
// PRODUCTION FRONTEND STATIC SERVING
// ======================================

const frontendDistPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(path.join(frontendDistPath, "index.html"))) {
  app.use(express.static(frontendDistPath));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "MediCare Backend is running successfully!",
    });
  });
}

// ======================================
// START SERVER
// ======================================

async function startServer() {
  try {
    await connectDB();

    // Ensure partial unique index replaces any legacy unconditional unique index.
    try {
      await Appointment.syncIndexes();
    } catch (indexErr) {
      console.warn("Appointment index sync note:", indexErr.message);
    }

    // Auto-seed starter doctors & demo accounts if database has no doctors yet.
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount === 0) {
      await seedDatabase({ silent: false });
    }

    app.listen(PORT, () => {
      console.log("----------------------------------");
      console.log("MediCare Backend Started");
      console.log(`Server: http://localhost:${PORT}`);
      console.log("MongoDB: Connected");
      console.log(
        `Google OAuth: ${isGoogleOAuthConfigured() ? "Configured" : "Not configured (add *.apps.googleusercontent.com Client ID)"}`
      );
      console.log("----------------------------------");
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();