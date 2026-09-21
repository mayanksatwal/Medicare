import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
  e.preventDefault();

  setLoading(true);
  setLoginError("");

  try {
    const response = await fetch("http://localhost:5001/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem("patientName", name);
      localStorage.setItem("patientEmail", email);

      navigate("/dashboard");
    } else {
      setLoginError(data.message || "Invalid email or password.");
    }
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    setLoginError("Unable to connect to MediCare server.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={`login-page ${loaded ? "login-loaded" : ""}`}>
      {/* LEFT PREMIUM BRAND EXPERIENCE */}

      <section className="login-visual">
        <div className="login-noise"></div>

        <div className="login-glow glow-one"></div>
        <div className="login-glow glow-two"></div>

        {/* BRAND */}

        <Link to="/" className="login-brand">
          <div className="login-brand-mark">✚</div>

          <div>
            <strong>MediCare</strong>
            <span>SMART HEALTHCARE</span>
          </div>
        </Link>

        {/* CONTENT */}

        <div className="login-visual-content">
          <div className="login-eyebrow">
            <span></span>
            WELCOME TO MEDICARE
          </div>

          <h1>
            Your health.
            <br />
            <em>Connected.</em>
          </h1>

          <p>
            One intelligent healthcare platform for
            discovering care, managing appointments
            and staying connected to your health journey.
          </p>

          {/* FEATURES */}

          <div className="login-benefits">
            <div className="login-benefit">
              <div>✦</div>

              <section>
                <strong>Smarter Healthcare</strong>
                <span>Technology designed around you</span>
              </section>
            </div>

            <div className="login-benefit">
              <div>◷</div>

              <section>
                <strong>Connected Appointments</strong>
                <span>Manage your care with ease</span>
              </section>
            </div>

            <div className="login-benefit">
              <div>◇</div>

              <section>
                <strong>Privacy-conscious</strong>
                <span>Designed with security in mind</span>
              </section>
            </div>
          </div>
        </div>

        {/* ABSTRACT PREMIUM VISUAL */}

        <div className="login-visual-art">
          <div className="art-ring ring-1"></div>
          <div className="art-ring ring-2"></div>
          <div className="art-ring ring-3"></div>

          <div className="art-center">
            <span>✚</span>
            <strong>MC</strong>
          </div>

          <div className="art-card art-card-one">
            <span>✦</span>

            <div>
              <strong>Smart Care</strong>
              <small>Connected healthcare</small>
            </div>
          </div>

          <div className="art-card art-card-two">
            <strong>24/7</strong>
            <small>Healthcare access</small>
          </div>
        </div>

        <div className="login-bottom">
          <span>SMART</span>
          <i>•</i>

          <span>CONNECTED</span>
          <i>•</i>

          <span>SECURE</span>
        </div>
      </section>

      {/* LOGIN FORM */}

      <section className="login-form-side">
        <div className="form-wrapper">
          {/* MOBILE BRAND */}

          <Link to="/" className="mobile-login-brand">
            <div className="login-brand-mark">✚</div>
            <strong>MediCare</strong>
          </Link>

          {/* BACK */}

          <Link to="/" className="back-home">
            <span>←</span>
            Back to home
          </Link>

          {/* HEADING */}

          <div className="form-heading">
            <div className="mini-label">SECURE ACCESS</div>

            <h2>
              Welcome
              <br />
              <em>back.</em>
            </h2>

            <p>
              Sign in to continue your personalized
              healthcare experience.
            </p>
          </div>

          {/* FORM */}

          <form onSubmit={handleLogin}>
            {/* PATIENT NAME */}

            <div className="field">
              <label>Patient name</label>

              <div className="field-box">
                <span className="field-icon">◉</span>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}

            <div className="field">
              <label>Email address</label>

              <div className="field-box">
                <span className="field-icon">@</span>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div className="field">
              <div className="password-label">
                <label>Password</label>

                <a href="#forgot-password">
                  Forgot password?
                </a>
              </div>

              <div className="field-box">
                <span className="field-icon">•••</span>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* REMEMBER */}

            <label className="remember-row">
              <input type="checkbox" />

              <span>Keep me signed in</span>
            </label>

            {/* LOGIN ERROR */}

            {loginError && (
              <p
                style={{
                  color: "#b42318",
                  marginBottom: "14px",
                  fontSize: "14px",
                }}
              >
                {loginError}
              </p>
            )}

            {/* MAIN BUTTON */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? "Signing in..."
                  : "Continue to MediCare"}
              </span>

              <b>↗</b>
            </button>

            {/* DIVIDER */}

            <div className="login-divider">
              <span>OR</span>
            </div>

            {/* GOOGLE */}

            <button
              type="button"
              className="google-login"
            >
              <span className="google-letter">G</span>

              Continue with Google
            </button>

            {/* SIGNUP */}

            <p className="signup-line">
              New to MediCare?

              <a href="#create-account">
                Create an account
              </a>
            </p>
          </form>

          {/* SECURITY CARD */}

          <div className="security-note">
            <span>◇</span>

            <div>
              <strong>Your privacy matters</strong>

              <p>
                Your information is handled with
                security and privacy in mind.
              </p>
            </div>
          </div>

          <div className="login-copyright">
            © 2026 MediCare · Smart Healthcare Platform
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;