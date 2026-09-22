import { Link, Navigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const savedEmail = localStorage.getItem("patientEmail");
  const patientName = localStorage.getItem("patientName") || "Mayank";

  if (!savedEmail) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="premium-dashboard">

      {/* =========================================
          SIDEBAR
      ========================================= */}
      <aside className="premium-sidebar">

        <div className="brand">
          <div className="brand-icon">M+</div>

          <div>
            <h2>MediCare</h2>
            <span>SMART HEALTHCARE</span>
          </div>
        </div>

        <div className="side-label">MENU</div>

        <nav>

          <Link to="/dashboard" className="side-link active">
            <span>⌂</span>
            Overview
          </Link>

          <Link to="/appointment" className="side-link">
            <span>◷</span>
            Appointments
          </Link>

          <a href="#health" className="side-link">
            <span>♡</span>
            Health records
          </a>

          <a href="#prescriptions" className="side-link">
            <span>▣</span>
            Prescriptions
          </a>

          <a href="#doctors" className="side-link">
            <span>♧</span>
            My doctors
          </a>

          <a href="#ai" className="side-link">
            <span>✦</span>
            MediCare AI
          </a>

        </nav>

        <div className="sidebar-spacer"></div>

        {/* SUPPORT */}
        <div className="support-box">
          <div className="support-icon">?</div>

          <div>
            <strong>Need assistance?</strong>
            <p>We're here for you, 24/7.</p>
          </div>

          <button>Contact support</button>
        </div>

        {/* LOGOUT */}
        <button
          className="logout"
          onClick={() => {
            localStorage.removeItem("patientEmail");
            localStorage.removeItem("patientName");
            window.location.href = "/login";
          }}
        >
          <span>↪</span>
          Sign out
        </button>

      </aside>


      {/* =========================================
          MAIN
      ========================================= */}
      <main className="premium-main">

        {/* =========================================
            TOPBAR
        ========================================= */}
        <header className="premium-topbar">

          <div className="search-box">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search doctors, appointments, records..."
            />

            <div className="search-shortcut">
              ⌘ K
            </div>

          </div>


          <div className="top-actions">

            <button className="notification">
              ♧
              <i></i>
            </button>

            <div className="profile">

              <div className="profile-avatar">
                {patientName.charAt(0).toUpperCase()}
              </div>

              <div className="profile-text">
                <strong>{patientName}</strong>
                <span>Patient</span>
              </div>

              <span className="profile-arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>


        {/* =========================================
            CONTENT
        ========================================= */}
        <div className="premium-content">


          {/* =========================================
              WELCOME
          ========================================= */}
          <section className="welcome">

            <div className="welcome-left">

              <div className="welcome-avatar">
                {patientName.charAt(0).toUpperCase()}
              </div>

              <div>

                <span className="eyebrow">
                  YOUR HEALTH, YOUR SPACE
                </span>

                <h1>
                  Good morning, {patientName}.
                </h1>

                <p>
                  Here's a quick look at your healthcare journey today.
                </p>

              </div>

            </div>


            <div className="date-card">

              <span className="date-icon">
                ◷
              </span>

              <div>
                <strong>
                  20 September 2026
                </strong>

                <small>
                  Sunday · Today
                </small>
              </div>

            </div>

          </section>


          {/* =========================================
              STATS
          ========================================= */}
          <section className="stats">

            <div className="stat-card stat-blue">

              <div className="stat-top">
                <span>APPOINTMENTS</span>
                <div>◷</div>
              </div>

              <strong>01</strong>

              <p>
                Upcoming appointment
              </p>

            </div>


            <div className="stat-card stat-green">

              <div className="stat-top">
                <span>HEALTH RECORDS</span>
                <div>♡</div>
              </div>

              <strong>08</strong>

              <p>
                Medical documents
              </p>

            </div>


            <div className="stat-card stat-purple">

              <div className="stat-top">
                <span>PRESCRIPTIONS</span>
                <div>▣</div>
              </div>

              <strong>03</strong>

              <p>
                Active prescriptions
              </p>

            </div>


            <div className="stat-card stat-dark">

              <div className="stat-top">
                <span>HEALTH SCORE</span>
                <div>✦</div>
              </div>

              <strong>92</strong>

              <p>
                Excellent progress
              </p>

            </div>

          </section>


          {/* =========================================
              NEXT APPOINTMENT
          ========================================= */}
          <section className="next-appointment-section">

            <div className="section-heading-row">

              <div>

                <span className="section-kicker">
                  UPCOMING
                </span>

                <h2>
                  Next appointment
                </h2>

                <p>
                  Your upcoming consultation at a glance.
                </p>

              </div>


              <Link
                to="/appointment"
                className="view-all-btn"
              >
                View all appointments →
              </Link>

            </div>


            <div className="next-appointment-card">

              {/* DATE */}

              <div className="appointment-date-box">

                <span>
                  SEP
                </span>

                <strong>
                  24
                </strong>

                <small>
                  2026
                </small>

              </div>


              {/* DOCTOR INFORMATION */}

              <div className="appointment-main-info">

                <div className="doctor-profile">

                  <div className="doctor-avatar">
                    AS
                  </div>

                  <div>

                    <h3>
                      Dr. Ananya Sharma
                    </h3>

                    <p>
                      Dermatology Specialist
                    </p>

                    <div className="doctor-meta">

                      <span>
                        ★ 4.9
                      </span>

                      <span>
                        •
                      </span>

                      <span>
                        8 years experience
                      </span>

                    </div>

                  </div>

                </div>


                {/* APPOINTMENT DETAILS */}

                <div className="appointment-details">

                  <div className="appointment-detail">

                    <span className="detail-icon">
                      ◷
                    </span>

                    <div>

                      <small>
                        TIME
                      </small>

                      <strong>
                        10:30 AM
                      </strong>

                    </div>

                  </div>


                  <div className="appointment-detail">

                    <span className="detail-icon">
                      ⌖
                    </span>

                    <div>

                      <small>
                        LOCATION
                      </small>

                      <strong>
                        MediCare Clinic
                      </strong>

                    </div>

                  </div>


                  <div className="appointment-detail">

                    <span className="detail-icon">
                      ▣
                    </span>

                    <div>

                      <small>
                        TYPE
                      </small>

                      <strong>
                        In-person visit
                      </strong>

                    </div>

                  </div>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="appointment-actions">

                <span className="appointment-status">

                  <i></i>

                  Confirmed

                </span>


                <button className="appointment-action-btn">
                  View details
                </button>


                <button className="appointment-more-btn">
                  ⋮
                </button>

              </div>

            </div>

          </section>


          {/* =========================================
              MY DOCTORS
          ========================================= */}
          <section
            className="my-doctors-section"
            id="doctors"
          >

            <div className="section-heading-row">

              <div>

                <span className="section-kicker">
                  YOUR CARE TEAM
                </span>

                <h2>
                  My Doctors
                </h2>

                <p>
                  Doctors you've recently consulted with.
                </p>

              </div>


              <Link
                to="/appointment"
                className="view-all-btn"
              >
                Find a doctor →
              </Link>

            </div>


            <div className="my-doctors-grid">


              {/* DOCTOR 1 */}

              <div className="my-doctor-card">

                <div className="my-doctor-avatar blue">
                  AS
                </div>

                <div className="my-doctor-info">

                  <h3>
                    Dr. Ananya Sharma
                  </h3>

                  <p>
                    Dermatology Specialist
                  </p>

                  <div className="doctor-rating">

                    ★ 4.9

                    <span>
                      •
                    </span>

                    8 years experience

                  </div>

                </div>


                <Link
                  to="/appointment"
                  className="doctor-book-btn"
                >
                  Book
                </Link>

              </div>


              {/* DOCTOR 2 */}

              <div className="my-doctor-card">

                <div className="my-doctor-avatar green">
                  RM
                </div>

                <div className="my-doctor-info">

                  <h3>
                    Dr. Rahul Mehta
                  </h3>

                  <p>
                    Cardiology Specialist
                  </p>

                  <div className="doctor-rating">

                    ★ 4.8

                    <span>
                      •
                    </span>

                    12 years experience

                  </div>

                </div>


                <Link
                  to="/appointment"
                  className="doctor-book-btn"
                >
                  Book
                </Link>

              </div>


              {/* DOCTOR 3 */}

              <div className="my-doctor-card">

                <div className="my-doctor-avatar purple">
                  PK
                </div>

                <div className="my-doctor-info">

                  <h3>
                    Dr. Priya Kapoor
                  </h3>

                  <p>
                    Neurology Specialist
                  </p>

                  <div className="doctor-rating">

                    ★ 4.9

                    <span>
                      •
                    </span>

                    10 years experience

                  </div>

                </div>


                <Link
                  to="/appointment"
                  className="doctor-book-btn"
                >
                  Book
                </Link>

              </div>

            </div>

          </section>


          {/* =========================================
              RECENT APPOINTMENTS
          ========================================= */}
          <section
            className="glass-section"
            id="appointments"
          >

            <div className="section-header">

              <div>

                <span className="section-eyebrow">
                  YOUR ACTIVITY
                </span>

                <h2>
                  Recent appointments
                </h2>

              </div>


              <Link to="/appointment">
                View all →
              </Link>

            </div>


            <div className="appointment-list">


              <div className="appointment-row heading">

                <span>
                  DOCTOR
                </span>

                <span>
                  SPECIALTY
                </span>

                <span>
                  DATE
                </span>

                <span>
                  STATUS
                </span>

              </div>


              {/* APPOINTMENT 1 */}

              <div className="appointment-row">

                <div className="doctor-cell">

                  <div className="mini-avatar blue-avatar">
                    AS
                  </div>

                  <div>

                    <strong>
                      Dr. Ananya Sharma
                    </strong>

                    <small>
                      Dermatologist
                    </small>

                  </div>

                </div>


                <span>
                  Dermatology
                </span>


                <span>

                  20 Sep 2026

                  <small>
                    4:30 PM
                  </small>

                </span>


                <b className="badge upcoming">
                  Upcoming
                </b>

              </div>


              {/* APPOINTMENT 2 */}

              <div className="appointment-row">

                <div className="doctor-cell">

                  <div className="mini-avatar green-avatar">
                    RM
                  </div>

                  <div>

                    <strong>
                      Dr. Rahul Mehta
                    </strong>

                    <small>
                      Cardiologist
                    </small>

                  </div>

                </div>


                <span>
                  Cardiology
                </span>


                <span>

                  08 Sep 2026

                  <small>
                    11:00 AM
                  </small>

                </span>


                <b className="badge completed">
                  Completed
                </b>

              </div>

            </div>

          </section>


          {/* =========================================
              TWO COLUMNS
          ========================================= */}
          <div className="bottom-grid">


            {/* HEALTH */}

            <section
              className="glass-section health-section"
              id="health"
            >

              <div className="section-header">

                <div>

                  <span className="section-eyebrow">
                    WELLNESS
                  </span>

                  <h2>
                    Health overview
                  </h2>

                </div>


                <span className="view-all">
                  View records →
                </span>

              </div>


              <div className="health-grid">

                <div>

                  <span>
                    Blood pressure
                  </span>

                  <strong>
                    118/76
                  </strong>

                  <small>
                    Normal
                  </small>

                </div>


                <div>

                  <span>
                    Heart rate
                  </span>

                  <strong>
                    72 BPM
                  </strong>

                  <small>
                    Normal
                  </small>

                </div>


                <div>

                  <span>
                    Weight
                  </span>

                  <strong>
                    68 kg
                  </strong>

                  <small>
                    Updated recently
                  </small>

                </div>


                <div>

                  <span>
                    Health score
                  </span>

                  <strong>
                    92%
                  </strong>

                  <small>
                    Good progress
                  </small>

                </div>

              </div>

            </section>


            {/* QUICK ACTIONS */}

            <section className="glass-section quick-section">

              <div className="section-header">

                <div>

                  <span className="section-eyebrow">
                    QUICK ACCESS
                  </span>

                  <h2>
                    What do you need?
                  </h2>

                </div>

              </div>


              <div className="quick-grid">

                <Link to="/appointment">

                  <span>
                    ＋
                  </span>

                  Book appointment

                </Link>


                <a href="#health">

                  <span>
                    ♡
                  </span>

                  Health records

                </a>


                <a href="#prescriptions">

                  <span>
                    ▣
                  </span>

                  Prescriptions

                </a>


                <a href="#ai">

                  <span>
                    ✦
                  </span>

                  AI assistant

                </a>

              </div>

            </section>

          </div>


          {/* =========================================
              PRESCRIPTIONS ANCHOR
          ========================================= */}
          <section
            id="prescriptions"
            className="dashboard-anchor-section"
          >
            <span className="section-eyebrow">
              MEDICATIONS
            </span>

            <h2>
              Prescriptions
            </h2>

            <p>
              Your active prescriptions and medication information
              will appear here.
            </p>
          </section>


          {/* =========================================
              AI
          ========================================= */}
          <section
            className="ai-card"
            id="ai"
          >

            <div className="ai-symbol">
              ✦
            </div>


            <div className="ai-content">

              <span>
                MEDICARE INTELLIGENCE
              </span>

              <h2>
                Your personal health assistant.
              </h2>

              <p>
                Understand your health information, prepare for
                appointments and get helpful guidance in one place.
              </p>

            </div>


            <button>
              Explore MediCare AI →
            </button>

          </section>


          {/* =========================================
              HEALTH TIP
          ========================================= */}
          <section className="health-tip">

            <div className="tip-symbol">
              ✦
            </div>

            <div>

              <span>
                HEALTH NOTE
              </span>

              <h3>
                Your everyday habits shape your long-term health.
              </h3>

              <p>
                Keep your appointments, stay hydrated and give your
                body enough time to rest.
              </p>

            </div>

          </section>


          {/* =========================================
              FOOTER
          ========================================= */}
          <footer className="dashboard-footer">

            <span>
              © 2026 MediCare
            </span>

            <span>
              Private · Secure · Designed around you
            </span>

          </footer>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;