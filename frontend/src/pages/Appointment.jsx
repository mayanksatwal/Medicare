import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Appointment.css";

function Appointment() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  const doctors = [
    {
      name: "Dr. Ananya Sharma",
      specialty: "Dermatology",
      experience: "8 years",
      initials: "AS",
      rating: "4.9",
      color: "blue",
    },
    {
      name: "Dr. Rahul Mehta",
      specialty: "Cardiology",
      experience: "12 years",
      initials: "RM",
      rating: "4.8",
      color: "green",
    },
    {
      name: "Dr. Priya Kapoor",
      specialty: "Neurology",
      experience: "10 years",
      initials: "PK",
      rating: "4.9",
      color: "purple",
    },
    {
      name: "Dr. Arjun Verma",
      specialty: "General Medicine",
      experience: "9 years",
      initials: "AV",
      rating: "4.7",
      color: "orange",
    },
  ];

  const appointments = [
    {
      doctor: "Dr. Ananya Sharma",
      specialty: "Dermatology",
      date: "20 September 2026",
      time: "4:30 PM",
      status: "Upcoming",
      initials: "AS",
    },
    {
      doctor: "Dr. Rahul Mehta",
      specialty: "Cardiology",
      date: "12 September 2026",
      time: "11:00 AM",
      status: "Completed",
      initials: "RM",
    },
  ];

  const filteredDoctors = doctors.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.specialty.toLowerCase().includes(search.toLowerCase())
  );

  const handleBooking = (e) => {
    e.preventDefault();

    const selectedDoctor = doctors.find(
      (item) => item.name === doctor
    );

    const appointment = {
      doctor: selectedDoctor?.name || "",
      specialty: selectedDoctor?.specialty || "",
      date,
      time,
      reason,
    };

    localStorage.setItem(
      "appointment",
      JSON.stringify(appointment)
    );

    setBookingMessage(
      "Appointment booked successfully!"
    );

    setTimeout(() => {
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="appointment-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="appointment-sidebar">

        <Link to="/dashboard" className="appointment-brand">
          <div className="appointment-logo">
            ✚
          </div>

          <div>
            <strong>
              Medi<span>Care</span>
            </strong>

            <small>
              SMART HEALTHCARE
            </small>
          </div>
        </Link>


        <div className="appointment-menu">

          <Link
            to="/dashboard"
            className="appointment-menu-item"
          >
            <span>⌂</span>
            Overview
          </Link>

          <Link
            to="/appointment"
            className="appointment-menu-item active"
          >
            <span>◷</span>
            Appointments
          </Link>

          <a
            href="#doctors"
            className="appointment-menu-item"
          >
            <span>♧</span>
            My Doctors
          </a>

          <a
            href="#records"
            className="appointment-menu-item"
          >
            <span>♡</span>
            Health Records
          </a>

          <a
            href="#available"
            className="appointment-menu-item"
          >
            <span>✦</span>
            Available Doctors
          </a>

        </div>


        <div className="appointment-sidebar-card">

          <div className="appointment-sidebar-icon">
            ✦
          </div>

          <h3>
            Find the right
            <br />
            care for you.
          </h3>

          <p>
            Choose a specialist and book
            your appointment in a few steps.
          </p>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <div className="appointment-content">

        {/* TOPBAR */}

        <header className="appointment-topbar">

          <div className="appointment-search">

            <span>⌕</span>

            <input
              type="text"
              placeholder="Search doctors or specialties..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          <div className="appointment-user">

            <button className="appointment-notification">
              ♧
              <i></i>
            </button>

            <div className="appointment-avatar">
              M
            </div>

            <div>
              <strong>Mayank</strong>
              <small>Patient</small>
            </div>

            <span>⌄</span>

          </div>

        </header>


        <main className="appointment-main">


          {/* PAGE HEADER */}

          <section className="appointment-page-header">

            <div>

              <span>
                PATIENT APPOINTMENTS
              </span>

              <h1>
                Book your
                <em> appointment.</em>
              </h1>

              <p>
                Find a specialist, choose a convenient
                time, and schedule your visit.
              </p>

            </div>

            <div className="appointment-header-card">

              <div className="header-card-icon">
                ◷
              </div>

              <div>
                <strong>01</strong>
                <small>
                  Upcoming appointment
                </small>
              </div>

            </div>

          </section>


          {/* BOOKING + INFO */}

          <section className="booking-layout">


            {/* BOOK FORM */}

            <div className="booking-card">

              <div className="booking-card-header">

                <div>

                  <span>
                    SCHEDULE YOUR VISIT
                  </span>

                  <h2>
                    Appointment details
                  </h2>

                </div>

                <div className="secure-label">
                  ◇ Secure
                </div>

              </div>


              <form onSubmit={handleBooking}>

                <div className="appointment-input-group">

                  <label>
                    Select doctor
                  </label>

                  <div className="appointment-input-box">

                    <span>♧</span>

                    <select
                      value={doctor}
                      onChange={(e) =>
                        setDoctor(e.target.value)
                      }
                      required
                    >

                      <option value="">
                        Choose a specialist
                      </option>

                      {doctors.map((item) => (
                        <option
                          key={item.name}
                          value={item.name}
                        >
                          {item.name} — {item.specialty}
                        </option>
                      ))}

                    </select>

                  </div>

                </div>


                <div className="appointment-two-fields">

                  <div className="appointment-input-group">

                    <label>
                      Preferred date
                    </label>

                    <div className="appointment-input-box">

                      <span>◷</span>

                      <input
                        type="date"
                        value={date}
                        onChange={(e) =>
                          setDate(e.target.value)
                        }
                        required
                      />

                    </div>

                  </div>


                  <div className="appointment-input-group">

                    <label>
                      Preferred time
                    </label>

                    <div className="appointment-input-box">

                      <span>◴</span>

                      <input
                        type="time"
                        value={time}
                        onChange={(e) =>
                          setTime(e.target.value)
                        }
                        required
                      />

                    </div>

                  </div>

                </div>


                <div className="appointment-input-group">

                  <label>
                    Reason for visit
                  </label>

                  <textarea
                    placeholder="Briefly describe what you need help with..."
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    rows="4"
                  />

                </div>


                {bookingMessage && (
                  <div className="booking-success">
                    ✓ {bookingMessage}
                  </div>
                )}


                <button
                  type="submit"
                  className="confirm-appointment"
                >
                  <span>
                    Confirm appointment
                  </span>

                  <b>→</b>
                </button>

              </form>

            </div>


            {/* RIGHT INFO */}

            <div className="booking-side">


              <div className="booking-info-card blue-info">

                <div className="info-icon">
                  ✓
                </div>

                <h3>
                  Easy appointment booking
                </h3>

                <p>
                  Select your preferred doctor,
                  date and time. Your appointment
                  will be saved to your dashboard.
                </p>

              </div>


              <div className="booking-info-card green-info">

                <div className="info-icon">
                  ✦
                </div>

                <h3>
                  Connected healthcare
                </h3>

                <p>
                  Keep track of your appointments,
                  doctors and health information
                  from one place.
                </p>

              </div>


              <div className="appointment-help">

                <span>?</span>

                <div>
                  <strong>
                    Need help choosing?
                  </strong>

                  <small>
                    Browse our available specialists below.
                  </small>
                </div>

              </div>

            </div>

          </section>


          {/* AVAILABLE DOCTORS */}

          <section
            className="doctors-section"
            id="available"
          >

            <div className="appointment-section-heading">

              <div>

                <span>
                  OUR SPECIALISTS
                </span>

                <h2>
                  Available doctors
                </h2>

              </div>

              <small>
                {filteredDoctors.length} doctors available
              </small>

            </div>


            <div className="doctor-cards">

              {filteredDoctors.map((item) => (

                <div
                  className="appointment-doctor-card"
                  key={item.name}
                >

                  <div
                    className={`doctor-card-avatar ${item.color}`}
                  >
                    {item.initials}
                  </div>


                  <div className="doctor-card-top">

                    <div>

                      <h3>
                        {item.name}
                      </h3>

                      <p>
                        {item.specialty}
                      </p>

                    </div>

                    <span className="online-dot">
                      ●
                    </span>

                  </div>


                  <div className="doctor-card-details">

                    <span>
                      ★ {item.rating}
                    </span>

                    <span>
                      {item.experience}
                    </span>

                    <span>
                      Available
                    </span>

                  </div>


                  <button
                    className="select-doctor"
                    onClick={() =>
                      setDoctor(item.name)
                    }
                  >
                    Select doctor
                    <b>→</b>
                  </button>

                </div>

              ))}

            </div>

          </section>


          {/* UPCOMING */}

          <section
            className="upcoming-section"
            id="records"
          >

            <div className="appointment-section-heading">

              <div>

                <span>
                  YOUR CARE
                </span>

                <h2>
                  Recent appointments
                </h2>

              </div>

              <Link to="/dashboard">
                View dashboard →
              </Link>

            </div>


            <div className="appointment-table">

              <div className="appointment-table-head">

                <span>DOCTOR</span>
                <span>SPECIALTY</span>
                <span>DATE & TIME</span>
                <span>STATUS</span>
                <span></span>

              </div>


              {appointments.map((item) => (

                <div
                  className="appointment-table-row"
                  key={item.doctor}
                >

                  <div className="appointment-doctor-name">

                    <div>
                      {item.initials}
                    </div>

                    <span>
                      <strong>
                        {item.doctor}
                      </strong>

                      <small>
                        MediCare Hospital
                      </small>
                    </span>

                  </div>


                  <span className="table-specialty">
                    {item.specialty}
                  </span>


                  <span className="table-date">
                    <strong>
                      {item.date}
                    </strong>

                    <small>
                      {item.time}
                    </small>
                  </span>


                  <span
                    className={
                      item.status === "Upcoming"
                        ? "appointment-status upcoming"
                        : "appointment-status completed"
                    }
                  >
                    {item.status}
                  </span>


                  <button className="table-view">
                    View
                  </button>

                </div>

              ))}

            </div>

          </section>


          {/* FOOTER */}

          <footer className="appointment-dashboard-footer">

            <div>

              <strong>
                Medi<span>Care</span>
              </strong>

              <p>
                Smart healthcare, designed around people.
              </p>

            </div>

            <div>
              <span>SECURE</span>
              <span>CONNECTED</span>
              <span>HUMAN</span>
            </div>

          </footer>

        </main>

      </div>

    </div>
  );
}

export default Appointment;