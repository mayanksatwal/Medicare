const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./db");
const User = require("./models/user");
const Doctor = require("./models/doctor");
const Appointment = require("./models/appointment");

dotenv.config();

const INITIAL_DOCTORS = [
  {
    name: "Dr. Aarav Mehta",
    email: "aarav@medicare.demo",
    specialty: "Cardiologist",
    qualification: "MBBS, MD, DM (Cardiology)",
    experience: "12 years",
    rating: 4.9,
    consultationFee: 800,
    location: "New Delhi",
    bio: "Senior Interventional Cardiologist specializing in preventive heart care, hypertension, and lipid management.",
    languages: ["English", "Hindi"],
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Dr. Ananya Sharma",
    email: "ananya@medicare.demo",
    specialty: "Dermatologist",
    qualification: "MBBS, MD (Dermatology)",
    experience: "9 years",
    rating: 4.8,
    consultationFee: 650,
    location: "Noida",
    bio: "Clinical and aesthetic dermatologist focusing on eczema, acne therapy, allergy care, and skin wellness.",
    languages: ["English", "Hindi"],
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Dr. Rohan Kapoor",
    email: "rohan@medicare.demo",
    specialty: "Neurologist",
    qualification: "MBBS, MD, DM (Neurology)",
    experience: "15 years",
    rating: 4.9,
    consultationFee: 900,
    location: "Ghaziabad",
    bio: "Specialist in migraine disorders, epilepsy, nerve conduction evaluations, and neuro-rehabilitation.",
    languages: ["English", "Hindi"],
    image: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    name: "Dr. Meera Joshi",
    email: "meera@medicare.demo",
    specialty: "Pediatrician",
    qualification: "MBBS, MD (Pediatrics)",
    experience: "11 years",
    rating: 4.9,
    consultationFee: 600,
    location: "Gurugram",
    bio: "Child health specialist providing immunization guidance, developmental tracking, and family-friendly care.",
    languages: ["English", "Hindi", "Marathi"],
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Dr. Vikram Nair",
    email: "vikram@medicare.demo",
    specialty: "Orthopedics",
    qualification: "MBBS, MS (Orthopedics)",
    experience: "14 years",
    rating: 4.8,
    consultationFee: 750,
    location: "New Delhi",
    bio: "Orthopedic & sports injury specialist focusing on joint mobility, spine posture care, and minimally invasive recovery.",
    languages: ["English", "Hindi", "Malayalam"],
    image: "https://randomuser.me/api/portraits/men/52.jpg",
  },
  {
    name: "Dr. Priya Verma",
    email: "priya@medicare.demo",
    specialty: "General Medicine",
    qualification: "MBBS, MD (Internal Medicine)",
    experience: "8 years",
    rating: 4.7,
    consultationFee: 500,
    location: "Noida",
    bio: "Primary care physician focused on diabetes care, seasonal fevers, metabolic wellness, and annual checkups.",
    languages: ["English", "Hindi"],
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

function formatFutureDate(daysFromToday) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function seedDatabase({ silent = false } = {}) {
  const doctorPasswordHash = await bcrypt.hash("Doctor@123", 10);
  const patientPasswordHash = await bcrypt.hash("Patient@123", 10);

  const createdDoctors = [];

  for (const item of INITIAL_DOCTORS) {
    let doctorUser = await User.findOne({ email: item.email });
    if (!doctorUser) {
      doctorUser = await User.create({
        name: item.name,
        email: item.email,
        password: doctorPasswordHash,
        role: "doctor",
        doctorVerificationStatus: "approved",
        authProvider: "local",
        avatar: item.image,
      });
    } else if (
      doctorUser.role !== "doctor" ||
      doctorUser.doctorVerificationStatus !== "approved"
    ) {
      doctorUser.role = "doctor";
      doctorUser.doctorVerificationStatus = "approved";
      await doctorUser.save();
    }

    const doctor = await Doctor.findOneAndUpdate(
      { userId: doctorUser._id },
      {
        $set: {
          userId: doctorUser._id,
          name: item.name,
          specialty: item.specialty,
          qualification: item.qualification,
          experience: item.experience,
          rating: item.rating,
          consultationFee: item.consultationFee,
          location: item.location,
          bio: item.bio,
          languages: item.languages,
          image: item.image,
          isAvailable: true,
        },
      },
      { upsert: true, new: true }
    );

    createdDoctors.push(doctor);
  }

  // Seed demo patient account for easy end-to-end testing.
  let demoPatient = await User.findOne({ email: "patient@medicare.demo" });
  if (!demoPatient) {
    demoPatient = await User.create({
      name: "Aarohi Sharma",
      email: "patient@medicare.demo",
      password: patientPasswordHash,
      role: "patient",
      doctorVerificationStatus: "not_required",
      authProvider: "local",
      phone: "+91 98765 43210",
      age: 29,
      gender: "Female",
      bloodGroup: "O+",
      allergies: "None reported",
      emergencyContact: "Rohan Sharma (+91 98111 22334)",
      healthMetrics: {
        bloodPressure: "118/76 mmHg",
        heartRate: "72 bpm",
        bloodSugar: "92 mg/dL",
        weight: "61 kg",
        height: "165 cm",
        updatedAt: new Date(),
      },
      healthRecords: [
        {
          title: "Annual Preventive Blood Panel",
          category: "Lab Report",
          date: formatFutureDate(-14),
          provider: "MediCare Diagnostics",
          summary:
            "CBC, Lipid Profile, and Fasting Glucose within healthy reference ranges.",
        },
        {
          title: "Cardiology Baseline ECG",
          category: "Checkup",
          date: formatFutureDate(-30),
          provider: "Dr. Aarav Mehta · MediCare Heart Center",
          summary: "Normal sinus rhythm. Routine yearly follow-up advised.",
        },
      ],
    });
  }

  // Seed starter appointments only when collection is empty.
  const existingAppointments = await Appointment.countDocuments();
  if (existingAppointments === 0 && createdDoctors.length >= 2) {
    await Appointment.create([
      {
        patient: demoPatient._id,
        doctor: createdDoctors[0]._id,
        date: formatFutureDate(2),
        time: "10:00",
        type: "In-Person",
        reason: "Routine blood pressure & cardiovascular wellness review",
        status: "approved",
      },
      {
        patient: demoPatient._id,
        doctor: createdDoctors[1]._id,
        date: formatFutureDate(4),
        time: "15:00",
        type: "Video Consultation",
        reason: "Seasonal skin dryness follow-up",
        status: "pending",
      },
      {
        patient: demoPatient._id,
        doctor: createdDoctors[5]._id,
        date: formatFutureDate(-7),
        time: "11:00",
        type: "In-Person",
        reason: "Annual general wellness consultation",
        status: "completed",
        notes: "Vitals stable. Stay hydrated and maintain regular sleep schedule.",
        prescription: {
          medications: [
            {
              name: "Vitamin D3 60,000 IU",
              dosage: "1 capsule",
              duration: "8 weeks (once weekly)",
              instructions: "Take after breakfast with water",
            },
            {
              name: "Multivitamin Complex",
              dosage: "1 tablet daily",
              duration: "30 days",
              instructions: "After lunch",
            },
          ],
          advice:
            "Walk 30 minutes daily, stay hydrated (2.5L/day), and repeat wellness labs in 6 months.",
          issuedAt: new Date(),
        },
      },
    ]);
  }

  if (!silent) {
    console.log(
      `Seeded ${createdDoctors.length} doctors and demo accounts successfully.`
    );
  }
}

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
    } catch (error) {
      console.error("Seeding failed:", error.message);
      process.exitCode = 1;
    } finally {
      await mongoose.disconnect();
    }
  })();
}

module.exports = { seedDatabase };
