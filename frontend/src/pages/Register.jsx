import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  HeartPulse,
  MapPin,
  BriefcaseMedical,
  UserRound,
  Stethoscope,
  GraduationCap,
  IndianRupee,
} from "lucide-react";
import { useAuthConfig } from "../main.jsx";
import { API_URL, saveSession } from "../utils/api.js";
import "./Auth.css";

const SPECIALTY_SUGGESTIONS = [
  "Cardiologist",
  "Neurologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedics",
  "Gynecologist",
  "Dentist",
  "General Medicine",
];

function Register() {
  const navigate = useNavigate();
  const { googleEnabled } = useAuthConfig();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
    specialty: "",
    qualification: "",
    location: "",
    experience: "",
    consultationFee: "600",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = useMemo(() => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", cls: "weak" };
    if (score <= 3) return { label: "Good", cls: "good" };
    return { label: "Strong", cls: "strong" };
  }, [form.password]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (
      form.role === "doctor" &&
      (!form.specialty.trim() || !form.location.trim())
    ) {
      setError("Please enter your specialty and clinic location.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          specialty: form.specialty.trim(),
          qualification: form.qualification.trim(),
          location: form.location.trim(),
          experience: form.experience.trim(),
          consultationFee: Number(form.consultationFee) || 600,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to create your account.");
      }

      if (!data.token) {
        navigate("/login", {
          state: {
            message: "Account created successfully. Please sign in.",
          },
        });
        return;
      }

      const user = saveSession(data, form.email.trim());
      if (user.role === "doctor" || form.role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    setError("");
    if (!credentialResponse.credential) {
      setError("Google did not return a valid credential.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          role: form.role,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Google sign up failed.");
      }
      const user = saveSession(data);
      navigate(
        user.role === "doctor" ? "/doctor-dashboard" : "/dashboard",
        { replace: true }
      );
    } catch (err) {
      setError(err.message || "Unable to complete Google registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-icon">
            <HeartPulse size={25} />
          </span>
          <span>MediCare</span>
        </Link>

        <div className="auth-left-content">
          <span className="auth-tag">YOUR HEALTH, OUR PRIORITY</span>
          <h1>
            Healthcare that
            <br />
            cares about <span>you.</span>
          </h1>
          <p>
            Join MediCare as a patient or specialist and experience seamless
            appointments, digital health records, and AI-guided wellness.
          </p>

          <div className="auth-feature">
            <span>✓</span>
            <div>
              <strong>Instant slot scheduling</strong>
              <small>Book and reschedule consultations with ease.</small>
            </div>
          </div>

          <div className="auth-feature">
            <span>✓</span>
            <div>
              <strong>Personal health dashboard</strong>
              <small>Track vitals, records, and prescriptions in one place.</small>
            </div>
          </div>

          <div className="auth-feature">
            <span>✓</span>
            <div>
              <strong>Dedicated Doctor Portal</strong>
              <small>Manage availability, approvals, and patient prescriptions.</small>
            </div>
          </div>
        </div>

        <div className="auth-left-footer">
          © {new Date().getFullYear()} MediCare Healthcare
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-mobile-logo">
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "inherit", textDecoration: "none" }}>
            <HeartPulse size={25} /> MediCare
          </Link>
        </div>

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={15} /> Back to Home
          </Link>

          <div className="auth-heading">
            <span className="auth-tag">GET STARTED</span>
            <h2>Create your account</h2>
            <p>Choose your role and complete your profile details.</p>
          </div>

          <form onSubmit={handleRegister}>
            <label className="auth-label">I am registering as</label>
            <div className="role-toggle">
              <button
                type="button"
                className={form.role === "patient" ? "active" : ""}
                onClick={() => setForm({ ...form, role: "patient" })}
              >
                <UserRound size={17} /> Patient
              </button>
              <button
                type="button"
                className={form.role === "doctor" ? "active" : ""}
                onClick={() => setForm({ ...form, role: "doctor" })}
              >
                <Stethoscope size={17} /> Doctor
              </button>
            </div>

            <label className="auth-label">Full name</label>
            <div className="auth-input">
              <User size={19} />
              <input
                name="name"
                type="text"
                placeholder={
                  form.role === "doctor"
                    ? "e.g. Dr. Siddharth Rao"
                    : "Enter your full name"
                }
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <label className="auth-label">Email address</label>
            <div className="auth-input">
              <Mail size={19} />
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <AnimatePresence>
              {form.role === "doctor" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <label className="auth-label">Medical specialty</label>
                  <div className="auth-input">
                    <BriefcaseMedical size={19} />
                    <input
                      name="specialty"
                      list="specialty-list"
                      type="text"
                      placeholder="e.g. Cardiologist"
                      value={form.specialty}
                      onChange={handleChange}
                      required
                    />
                    <datalist id="specialty-list">
                      {SPECIALTY_SUGGESTIONS.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>

                  <label className="auth-label">Qualification</label>
                  <div className="auth-input">
                    <GraduationCap size={19} />
                    <input
                      name="qualification"
                      type="text"
                      placeholder="e.g. MBBS, MD (Cardiology)"
                      value={form.qualification}
                      onChange={handleChange}
                    />
                  </div>

                  <label className="auth-label">Hospital / Clinic location</label>
                  <div className="auth-input">
                    <MapPin size={19} />
                    <input
                      name="location"
                      type="text"
                      placeholder="e.g. New Delhi"
                      value={form.location}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="auth-two-col">
                    <div>
                      <label className="auth-label">Experience</label>
                      <div className="auth-input">
                        <BriefcaseMedical size={17} />
                        <input
                          name="experience"
                          type="text"
                          placeholder="e.g. 6 years"
                          value={form.experience}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="auth-label">Fee (₹)</label>
                      <div className="auth-input">
                        <IndianRupee size={17} />
                        <input
                          name="consultationFee"
                          type="number"
                          min="0"
                          placeholder="600"
                          value={form.consultationFee}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="auth-label">Password</label>
            <div className="auth-input">
              <Lock size={19} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {passwordStrength && (
              <div className={`password-strength ${passwordStrength.cls}`}>
                <span />
                <small>Password strength: {passwordStrength.label}</small>
              </div>
            )}

            <label className="auth-label">Confirm password</label>
            <div className="auth-input">
              <Lock size={19} />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter your password again"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle confirmation password visibility"
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          {googleEnabled && (
            <>
              <div className="auth-divider">
                <span>OR SIGN UP WITH GOOGLE</span>
              </div>
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSignup}
                  onError={() =>
                    setError("Google sign-up was unsuccessful. Please try again.")
                  }
                  theme="outline"
                  size="large"
                  shape="rect"
                  text="signup_with"
                  width="380"
                />
              </div>
            </>
          )}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <p className="auth-security">
            🔒 Your account information is handled securely.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
