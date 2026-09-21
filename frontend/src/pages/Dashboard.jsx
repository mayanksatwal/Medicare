import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [patientName, setPatientName] = useState("Patient");

useEffect(() => {
  const savedName = localStorage.getItem("patientName");

  if (savedName) {
    setPatientName(savedName);
  }
}, []);
  const [showAppointment, setShowAppointment] = useState(false);
const [showReschedule, setShowReschedule] = useState(false);
  return (
    <div className="dashboard-page">

      {/* NAVBAR */}
      <nav className="dashboard-nav">

        <Link to="/" className="dashboard-brand">
          <div className="dashboard-brand-mark">+</div>

          <div className="dashboard-brand-text">
            <strong>MediCare</strong>
            <span>SMART HEALTHCARE</span>
          </div>
        </Link>

        <div className="dashboard-nav-links">
          <a href="#overview">Overview</a>
          <a href="#appointments">Appointments</a>
          <a href="#services">Services</a>
        </div>

        <div className="dashboard-nav-actions">

          <button className="notification-button">
            ♧
            <span></span>
          </button>

          <div className="user-avatar">
            M
          </div>

        </div>

      </nav>


      {/* MAIN */}
      <main className="dashboard-main">

        {/* WELCOME */}
        <section className="dashboard-welcome" id="overview">

          <div>

            <span className="dashboard-eyebrow">
              PATIENT DASHBOARD
            </span>

            <h1>
              Good afternoon,
              <br />
              <em>{patientName}</em>
            </h1>

            <p>
              Here's everything you need to stay
              connected with your healthcare.
            </p>

          </div>

          <div className="dashboard-date">
S
            <span>TODAY</span>

            <strong>
              20 September 2026
            </strong>

            <small>
              Saturday
            </small>

          </div>

        </section>


        {/* OVERVIEW CARDS */}
        <section className="overview-cards">

          <div className="overview-card">

            <div className="overview-icon gold-icon">
              ◷
            </div>

            <div>
              <span>UPCOMING</span>
              <strong>01</strong>
              <small>Appointment</small>
            </div>

          </div>


          <div className="overview-card">

            <div className="overview-icon">
              ✚
            </div>

            <div>
              <span>HEALTH RECORDS</span>
              <strong>08</strong>
              <small>Documents</small>
            </div>

          </div>


          <div className="overview-card">

            <div className="overview-icon">
              ♡
            </div>

            <div>
              <span>FAVORITE DOCTORS</span>
              <strong>04</strong>
              <small>Specialists</small>
            </div>

          </div>


          <div className="overview-card">

            <div className="overview-icon">
              ✦
            </div>

            <div>
              <span>MEDICARE AI</span>
              <strong>24/7</strong>
              <small>Available</small>
            </div>

          </div>

        </section>


        {/* APPOINTMENT AREA */}
        <section
          className="dashboard-grid"
          id="appointments"
        >

          {/* MAIN APPOINTMENT */}
          <div className="main-appointment">

            <div className="section-heading-row">

              <div>
                <span>YOUR NEXT VISIT</span>
                <h2>
                  Upcoming appointment
                </h2>
              </div>

              <span className="confirmed-status">
                ● Confirmed
              </span>

            </div>


            <div className="appointment-doctor">

              <div className="appointment-doctor-image">

                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt="Dr. Ananya Sharma"
                />

                <span className="online-dot"></span>

              </div>


              <div className="appointment-doctor-info">

                <span>DERMATOLOGY</span>

                <h3>
                  Dr. Ananya Sharma
                </h3>

                <p>
                  Dermatologist · 9 years experience
                </p>

                <div className="doctor-rating">
                  ★ 4.8
                  <span>
                    New Delhi
                  </span>
                </div>

              </div>


              <div className="appointment-time">

                <span>TODAY</span>

                <strong>
                  4:30
                </strong>

                <small>
                  PM
                </small>

              </div>

            </div>


            <div className="appointment-location">

              <div>
                <span>⌖</span>

                <section>
                  <strong>
                    MediCare City Hospital
                  </strong>

                  <small>
                    New Delhi · 2.4 km away
                  </small>
                </section>
              </div>

              <button>
                Get directions →
              </button>

            </div>


            <div className="appointment-actions">

              <button onClick={() => setShowReschedule(true)}>
  Reschedule
</button>

<button
  className="dark-button"
  onClick={() => setShowAppointment(true)}
>
  View appointment →
</button>

            </div>

          </div>


          {/* QUICK ACTION */}
          <div className="quick-actions">

            <span>QUICK ACTIONS</span>

            <h2>
              What would you
              <br />
              like to <em>do?</em>
            </h2>


            <Link to="/#doctors" className="quick-action">

              <div>
                <span>⌕</span>
              </div>

              <section>
                <strong>
                  Find a doctor
                </strong>

                <small>
                  Discover specialists
                </small>
              </section>

              <b>↗</b>

            </Link>


            <Link to="/#doctors" className="quick-action">

              <div>
                <span>◷</span>
              </div>

              <section>
                <strong>
                  Book appointment
                </strong>

                <small>
                  Schedule your next visit
                </small>
              </section>

              <b>↗</b>

            </Link>


            <button className="quick-action">

              <div>
                <span>✦</span>
              </div>

              <section>
                <strong>
                  Ask MediCare AI
                </strong>

                <small>
                  Get healthcare guidance
                </small>
              </section>

              <b>↗</b>

            </button>

          </div>

        </section>


        {/* LOWER GRID */}
        <section className="lower-grid">


          {/* AI */}
          <div className="dashboard-ai">

            <div className="ai-small-orbit"></div>

            <div className="dashboard-ai-content">

              <span>
                SMART HEALTHCARE
              </span>

              <h2>
                Your health,
                <br />
                <em>with intelligence.</em>
              </h2>

              <p>
                MediCare AI can help you navigate
                doctors, appointments and healthcare
                information.
              </p>

             <button
  onClick={() => {
    document
      .getElementById("medicare-ai-panel")
      ?.scrollIntoView({ behavior: "smooth" });
  }}
>
  Open MediCare AI
  <b>↗</b>
</button>
            </div>


            <div className="ai-dashboard-core">

              <span>✦</span>

              <strong>
                AI
              </strong>

              <small>
                MEDICARE
              </small>

            </div>

          </div>


          {/* ACTIVITY */}
          <div className="activity-card">

            <div className="activity-heading">

              <div>
                <span>RECENT ACTIVITY</span>
                <h2>
                  Your activity
                </h2>
              </div>

              <button>
                View all
              </button>

            </div>


            <div className="activity-item">

              <div className="activity-icon">
                ✓
              </div>

              <div>
                <strong>
                  Appointment confirmed
                </strong>

                <span>
                  Dr. Ananya Sharma · Today
                </span>
              </div>

              <small>
                10:24 AM
              </small>

            </div>


            <div className="activity-item">

              <div className="activity-icon">
                +
              </div>

              <div>
                <strong>
                  Health record added
                </strong>

                <span>
                  Blood test report
                </span>
              </div>

              <small>
                Yesterday
              </small>

            </div>


            <div className="activity-item">

              <div className="activity-icon">
                ★
              </div>

              <div>
                <strong>
                  Doctor added to favorites
                </strong>

                <span>
                  Dr. Rohan Kapoor
                </span>
              </div>

              <small>
                2 days ago
              </small>

            </div>

          </div>

        </section>


        {/* HEALTH SERVICES */}
        <section
          className="dashboard-services"
          id="services"
        >

          <div className="services-heading">

            <div>

              <span>
                YOUR HEALTHCARE
              </span>

              <h2>
                Everything you
                <br />
                need, <em>right here.</em>
              </h2>

            </div>

            <p>
              Explore the healthcare services
              available through MediCare.
            </p>

          </div>


          <div className="dashboard-service-grid">

            <div className="dashboard-service-card">

              <span>01</span>

              <div>✚</div>

              <h3>
                Health Records
              </h3>

              <p>
                Keep your important medical
                information organized.
              </p>

              <button>
                Open records →
              </button>

            </div>


            <div className="dashboard-service-card">

              <span>02</span>

              <div>◷</div>

              <h3>
                Appointments
              </h3>

              <p>
                Manage upcoming and previous
                consultations.
              </p>

              <button>
                Manage visits →
              </button>

            </div>


            <div className="dashboard-service-card">

              <span>03</span>

              <div>⌁</div>

              <h3>
                Medicine
              </h3>

              <p>
                Keep track of your healthcare
                routine and reminders.
              </p>

              <button>
                View medicines →
              </button>

            </div>


            <div className="dashboard-service-card dark-service">

              <span>04</span>

              <div>✦</div>

              <h3>
                MediCare AI
              </h3>

              <p>
                Get intelligent assistance whenever
                you need it.
              </p>

              <button>
                Talk to AI →
              </button>

            </div>

          </div>

        </section>


        {/* FOOTER */}
        {/* MEDICARE AI PANEL */}
<section
  className="medicare-ai-panel"
  id="medicare-ai-panel"
>
  <div className="ai-panel-header">

    <div>
      <span>MEDICARE INTELLIGENCE</span>

      <h2>
        How can I help
        <br />
        <em>you today?</em>
      </h2>

      <p>
        Your MediCare AI assistant can help you
        navigate doctors, appointments and
        healthcare services.
      </p>
    </div>

    <div className="ai-status">
      <span></span>
      AI Online
    </div>

  </div>


  <div className="ai-chat-area">

    <div className="ai-message ai-message-bot">

      <div className="ai-message-icon">
        ✦
      </div>

      <div>
        <strong>MediCare AI</strong>

        <p>
          Hello Mayank! I'm here to help you
          navigate your healthcare journey.
          What would you like to do?
        </p>
      </div>

    </div>


    <div className="ai-options">

      <button>
        <span>⌕</span>
        Find a doctor
        <b>→</b>
      </button>

      <button>
        <span>◷</span>
        Book an appointment
        <b>→</b>
      </button>

      <button>
        <span>⌖</span>
        Find nearby hospitals
        <b>→</b>
      </button>

      <button>
        <span>✚</span>
        View health services
        <b>→</b>
      </button>

    </div>


    <div className="ai-input">

      <input
        type="text"
        placeholder="Ask MediCare AI something..."
      />

      <button>
        ↑
      </button>

    </div>

  </div>
</section>
{showAppointment && (
  <div
    className="dashboard-modal-overlay"
    onClick={() => setShowAppointment(false)}
  >
    <div
      className="dashboard-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="modal-close"
        onClick={() => setShowAppointment(false)}
      >
        ×
      </button>

      <span>APPOINTMENT DETAILS</span>

      <h2>
        Your appointment
      </h2>

      <div className="modal-doctor">

        <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="Dr. Ananya Sharma"
        />

        <div>
          <strong>
            Dr. Ananya Sharma
          </strong>

          <small>
            Dermatologist
          </small>
        </div>

      </div>

      <div className="modal-details">

        <div>
          <span>DATE</span>
          <strong>Today</strong>
        </div>

        <div>
          <span>TIME</span>
          <strong>4:30 PM</strong>
        </div>

        <div>
          <span>LOCATION</span>
          <strong>MediCare City Hospital</strong>
        </div>

        <div>
          <span>TYPE</span>
          <strong>Consultation</strong>
        </div>

      </div>

      <div className="modal-confirmed">
        ✓ Appointment confirmed
      </div>

    </div>
  </div>
)}
{showReschedule && (
  <div
    className="dashboard-modal-overlay"
    onClick={() => setShowReschedule(false)}
  >
    <div
      className="dashboard-modal reschedule-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="modal-close"
        onClick={() => setShowReschedule(false)}
      >
        ×
      </button>

      <span>RESCHEDULE APPOINTMENT</span>

      <h2>
        Choose a new time
      </h2>

      <p className="modal-description">
        Select a convenient time for your consultation
        with Dr. Ananya Sharma.
      </p>

      <div className="time-options">

        <button>2:00 PM</button>
        <button>3:00 PM</button>
        <button className="selected-time">
          4:30 PM
        </button>
        <button>5:30 PM</button>
        <button>6:00 PM</button>
        <button>7:00 PM</button>

      </div>

      <button
        className="confirm-reschedule"
        onClick={() => setShowReschedule(false)}
      >
        Confirm new time →
      </button>

    </div>
  </div>
)}
        <footer className="medicare-ai-panel">

          <div className="footer-dashboard-brand">

            <div className="dashboard-brand-mark">
              +
            </div>

            <div>
              <strong>MediCare</strong>
              <span>
                SMART HEALTHCARE
              </span>
            </div>

          </div>


          <div>
            <span>
              Need help?
            </span>

            <strong>
              Contact MediCare Support →
            </strong>
          </div>


          <span>
            © 2026 MediCare
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Dashboard;