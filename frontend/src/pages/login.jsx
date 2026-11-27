import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  HeartPulse,
  Stethoscope,
  UserRound,
  Info,
} from "lucide-react";
import { useAuthConfig } from "../main.jsx";
import { API_URL, saveSession } from "../utils/api.js";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { googleEnabled } = useAuthConfig();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleHint, setGoogleHint] = useState(false);
  const [message] = useState(location.state?.message || "");

  const redirectAfterAuth = (user) => {
    if (user?.role === "doctor") {
      navigate("/doctor-dashboard", { replace: true });
      return;
    }
    const destination = location.state?.from || "/dashboard";
    navigate(destination, { replace: true });
  };

  const performLogin = async (loginEmail, loginPassword) => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Invalid email or password.");
      }

      const user = saveSession(data, loginEmail.trim());
      redirectAfterAuth(user);
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleDemoLogin = async (role) => {
    const creds =
      role === "doctor"
        ? { email: "aarav@medicare.demo", password: "Doctor@123" }
        : { email: "patient@medicare.demo", password: "Patient@123" };
    setEmail(creds.email);
    setPassword(creds.password);
    await performLogin(creds.email, creds.password);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");

    if (!credentialResponse.credential) {
      setError("Google did not provide a valid credential. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Google login failed.");
      }

      const user = saveSession(data);
      redirectAfterAuth(user);
    } catch (err) {
      setError(err.message || "Unable to complete Google login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In was cancelled or unsuccessful. Please try again.");
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
          <span className="auth-tag">WELCOME BACK</span>
          <h1>
            Your health.
            <br />
            Your care.
            <br />
            <span>One place.</span>
          </h1>
          <p>
            Sign in to book live specialist slots, manage prescriptions, track
            your health vitals, and chat with MediAI.
          </p>

          <div className="auth-feature">
            <span>✓</span>
            <div>
              <strong>Real-time appointment booking</strong>
              <small>View available slots and reschedule anytime.</small>
            </div>
          </div>

          <div className="auth-feature">
            <span>✓</span>
            <div>
              <strong>Connected patient & doctor portals</strong>
              <small>Digital prescriptions, records, and MediAI support.</small>
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
            <span className="auth-tag">WELCOME BACK</span>
            <h2>Sign in to MediCare</h2>
            <p>Enter your registered email and password, or continue with Google.</p>
          </div>

          {message && <div className="auth-success">{message}</div>}

          <form onSubmit={handleLogin}>
            <label className="auth-label">Email address</label>

            <div className="auth-input">
              <Mail size={19} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <label className="auth-label">Password</label>

            <div className="auth-input">
              <Lock size={19} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <div className="google-login-wrapper">
            {googleEnabled ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                shape="rect"
                text="signin_with"
                width="380"
              />
            ) : (
              <div className="google-fallback-box">
                <button
                  type="button"
                  className="google-fallback-btn"
                  onClick={() => setGoogleHint((v) => !v)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                    />
                  </svg>
                  Continue with Google
                </button>
                {googleHint && (
                  <p className="google-setup-hint">
                    <Info size={14} /> Add a Google OAuth 2.0 Web Client ID (
                    <code>*.apps.googleusercontent.com</code>) in{" "}
                    <code>backend/.env</code> &amp; <code>frontend/.env</code>{" "}
                    to activate live Google Sign-In.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="demo-login-box">
            <span>INSTANT DEMO ACCESS</span>
            <div className="demo-login-actions">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("patient")}
              >
                <UserRound size={15} /> Demo Patient
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin("doctor")}
              >
                <Stethoscope size={15} /> Demo Doctor
              </button>
            </div>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>

          <p className="auth-security">
            🔒 Encrypted JWT sessions &amp; bcrypt-protected credentials.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;
