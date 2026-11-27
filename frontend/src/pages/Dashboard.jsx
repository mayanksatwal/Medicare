import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  API_URL,
  clearSession,
  formatExperience,
  formatSlotTime,
  getStoredUser,
  getTodayMinDate,
  getToken,
} from "../utils/api.js";
import "./Dashboard.css";

function formatDate(value) {
  if (!value) return "Date not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDoctorName(appointment) {
  const doctor = appointment?.doctor || appointment?.doctorId;
  if (typeof doctor === "string") return doctor;
  return doctor?.name || appointment?.doctorName || "Doctor";
}

function getDoctorSpecialty(appointment) {
  const doctor = appointment?.doctor || appointment?.doctorId;
  return (
    doctor?.specialty ||
    doctor?.specialization ||
    appointment?.specialization ||
    "General Consultation"
  );
}

function getDoctorLocation(appointment) {
  const doctor = appointment?.doctor || appointment?.doctorId;
  return doctor?.location || appointment?.location || "MediCare Clinic";
}

function Dashboard() {
  const navigate = useNavigate();
  const token = getToken();
  const initialUser = getStoredUser();

  const [user, setUser] = useState(initialUser);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [appointmentError, setAppointmentError] = useState("");
  const [doctorError, setDoctorError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [prescriptionModal, setPrescriptionModal] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  // Forms inside modals
  const [profileForm, setProfileForm] = useState({
    name: initialUser?.name || "",
    phone: initialUser?.phone || "",
    age: initialUser?.age ?? "",
    gender: initialUser?.gender || "",
    bloodGroup: initialUser?.bloodGroup || "",
    allergies: initialUser?.allergies || "",
    emergencyContact: initialUser?.emergencyContact || "",
    bloodPressure: initialUser?.healthMetrics?.bloodPressure || "",
    heartRate: initialUser?.healthMetrics?.heartRate || "",
    bloodSugar: initialUser?.healthMetrics?.bloodSugar || "",
    weight: initialUser?.healthMetrics?.weight || "",
    height: initialUser?.healthMetrics?.height || "",
  });

  const [recordForm, setRecordForm] = useState({
    title: "",
    category: "Lab Report",
    date: getTodayMinDate(),
    provider: "MediCare Diagnostics",
    summary: "",
  });

  const [supportForm, setSupportForm] = useState({
    subject: "Appointment Help",
    message: "",
  });

  const [rescheduleDate, setRescheduleDate] = useState(getTodayMinDate());
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [busyAction, setBusyAction] = useState(false);

  const syncProfileForm = (u) => {
    setProfileForm({
      name: u?.name || "",
      phone: u?.phone || "",
      age: u?.age ?? "",
      gender: u?.gender || "",
      bloodGroup: u?.bloodGroup || "",
      allergies: u?.allergies || "",
      emergencyContact: u?.emergencyContact || "",
      bloodPressure: u?.healthMetrics?.bloodPressure || "",
      heartRate: u?.healthMetrics?.heartRate || "",
      bloodSugar: u?.healthMetrics?.bloodSugar || "",
      weight: u?.healthMetrics?.weight || "",
      height: u?.healthMetrics?.height || "",
    });
  };

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    setLoadingAppointments(true);
    setLoadingDoctors(true);
    setAppointmentError("");
    setDoctorError("");

    try {
      const [meRes, apptRes, docRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/doctors`),
      ]);

      const meData = await meRes.json().catch(() => ({}));
      if (meRes.ok && meData.user) {
        setUser(meData.user);
        syncProfileForm(meData.user);
        localStorage.setItem("user", JSON.stringify(meData.user));
        localStorage.setItem("patientName", meData.user.name || "");
      }

      const apptData = await apptRes.json().catch(() => ({}));
      if (!apptRes.ok) {
        throw new Error(apptData.message || "Could not load appointments.");
      }
      setAppointments(apptData.appointments || []);

      const docData = await docRes.json().catch(() => ({}));
      if (!docRes.ok) {
        setDoctorError(docData.message || "Could not load doctors.");
      } else {
        setDoctors(docData.doctors || []);
      }
    } catch (err) {
      setAppointmentError(err.message || "Could not load dashboard data.");
    } finally {
      setLoadingAppointments(false);
      setLoadingDoctors(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Load slots for reschedule modal
  useEffect(() => {
    const docId = rescheduleTarget?.doctor?._id || rescheduleTarget?.doctor;
    if (!docId || !rescheduleDate) {
      setRescheduleSlots([]);
      return;
    }

    fetch(`${API_URL}/api/doctors/${docId}/slots?date=${rescheduleDate}`)
      .then((res) => res.json())
      .then((data) => setRescheduleSlots(data.slots || []))
      .catch(() => setRescheduleSlots([]));
  }, [rescheduleTarget, rescheduleDate]);

  const patientName = user?.name || "Patient";
  const healthRecords = user?.healthRecords || [];
  const metrics = user?.healthMetrics || {};

  const prescriptions = useMemo(
    () =>
      appointments.filter(
        (a) =>
          a.prescription &&
          ((a.prescription.medications && a.prescription.medications.length > 0) ||
            a.prescription.advice)
      ),
    [appointments]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter(
          (a) =>
            !["cancelled", "completed", "rejected"].includes(
              String(a.status || "").toLowerCase()
            )
        )
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
    [appointments]
  );

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const statusOk =
        statusFilter === "all" ||
        String(appointment.status || "").toLowerCase() === statusFilter;
      if (!statusOk) return false;
      if (!query) return true;
      return [
        getDoctorName(appointment),
        getDoctorSpecialty(appointment),
        appointment.status,
        appointment.date,
        appointment.reason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [appointments, search, statusFilter]);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return doctors;
    return doctors.filter((doctor) =>
      [doctor.name, doctor.specialty, doctor.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [doctors, search]);

  const showToast = (msg) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice((current) => (current === msg ? "" : current));
    }, 4500);
  };

  const handleCancelAppointment = async (id) => {
    setBusyAction(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/${id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to cancel.");
      showToast("Appointment cancelled and time slot released.");
      await loadDashboardData();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyAction(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return;
    setBusyAction(true);
    try {
      const res = await fetch(
        `${API_URL}/api/appointments/${rescheduleTarget._id}/reschedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: rescheduleDate,
            time: rescheduleTime,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reschedule failed.");
      setRescheduleTarget(null);
      setRescheduleTime("");
      showToast("Appointment rescheduled successfully!");
      await loadDashboardData();
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyAction(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setBusyAction(true);
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          age: profileForm.age,
          gender: profileForm.gender,
          bloodGroup: profileForm.bloodGroup,
          allergies: profileForm.allergies,
          emergencyContact: profileForm.emergencyContact,
          healthMetrics: {
            bloodPressure: profileForm.bloodPressure,
            heartRate: profileForm.heartRate,
            bloodSugar: profileForm.bloodSugar,
            weight: profileForm.weight,
            height: profileForm.height,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Profile save failed.");
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("patientName", data.user.name || "");
      setProfileModalOpen(false);
      showToast("Profile & health vitals updated!");
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyAction(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setBusyAction(true);
    try {
      const res = await fetch(`${API_URL}/api/health-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(recordForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not add record.");
      setUser(data.user);
      setRecordModalOpen(false);
      setRecordForm({
        title: "",
        category: "Lab Report",
        date: getTodayMinDate(),
        provider: "MediCare Diagnostics",
        summary: "",
      });
      showToast("Health record saved to your profile.");
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyAction(false);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      const res = await fetch(`${API_URL}/api/health-records/${recordId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to remove record.");
      setUser(data.user);
      showToast("Health record removed.");
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setBusyAction(true);
    try {
      const res = await fetch(`${API_URL}/api/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user?.name,
          email: user?.email,
          subject: supportForm.subject,
          message: supportForm.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Support request failed.");
      setSupportModalOpen(false);
      setSupportForm({ subject: "Appointment Help", message: "" });
      showToast(data.message || "Support ticket created!");
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyAction(false);
    }
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="premium-dashboard">
      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="dash-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`premium-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        <Link to="/" className="brand">
          <div className="brand-icon">M+</div>
          <div>
            <h2>MediCare</h2>
            <span>SMART HEALTHCARE</span>
          </div>
        </Link>

        <div className="side-label">MENU</div>

        <nav>
          <button
            type="button"
            className="side-link active"
            onClick={() => scrollToSection("top")}
          >
            <span>⌂</span>
            Overview
          </button>

          <Link to="/appointment" className="side-link">
            <span>◷</span>
            Book Appointment
          </Link>

          <button
            type="button"
            className="side-link"
            onClick={() => scrollToSection("health")}
          >
            <span>♡</span>
            Health records
          </button>

          <button
            type="button"
            className="side-link"
            onClick={() => scrollToSection("prescriptions")}
          >
            <span>▣</span>
            Prescriptions
          </button>

          <button
            type="button"
            className="side-link"
            onClick={() => scrollToSection("doctors")}
          >
            <span>✚</span>
            Available doctors
          </button>

          <button
            type="button"
            className="side-link"
            onClick={() => navigate("/medi-ai")}
          >
            <span>✦</span>
            MediCare AI
          </button>

          <Link to="/" className="side-link">
            <span>↗</span>
            Home site
          </Link>
        </nav>

        <div className="sidebar-spacer" />

        <div className="support-box">
          <div className="support-icon">?</div>
          <div>
            <strong>Need assistance?</strong>
            <p>Message our 24/7 care team.</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setSupportModalOpen(true);
            }}
          >
            Contact support
          </button>
        </div>

        <button className="logout" type="button" onClick={logout}>
          <span>↪</span>
          Sign out
        </button>
      </aside>

      {/* MAIN */}
      <main className="premium-main" id="top">
        {/* TOPBAR */}
        <header className="premium-topbar">
          <button
            type="button"
            className="dash-hamburger"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            ☰
          </button>

          <div className="search-box">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search doctors, appointments, status..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

            <div className="search-shortcut">Live Filter</div>
          </div>

          <div className="top-actions">
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="notification"
                aria-label="Notifications"
                onClick={() => setNotificationsOpen((v) => !v)}
              >
                🔔
                {(upcomingAppointments.length > 0 || prescriptions.length > 0) && (
                  <i />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="notif-dropdown"
                  >
                    <div className="notif-head">
                      <strong>Updates</strong>
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        ×
                      </button>
                    </div>
                    {upcomingAppointments.length === 0 &&
                    prescriptions.length === 0 ? (
                      <p className="notif-empty">No new notifications.</p>
                    ) : (
                      <div className="notif-items">
                        {upcomingAppointments.slice(0, 3).map((a) => (
                          <div key={a._id} className="notif-item">
                            <strong>
                              {getDoctorName(a)} ({a.status})
                            </strong>
                            <span>
                              {formatDate(a.date)} · {formatSlotTime(a.time)}
                            </span>
                          </div>
                        ))}
                        {prescriptions.slice(0, 2).map((p) => (
                          <div key={`rx-${p._id}`} className="notif-item">
                            <strong>Prescription available</strong>
                            <span>Issued by {getDoctorName(p)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              className="profile"
              onClick={() => setProfileModalOpen(true)}
            >
              <div className="profile-avatar">
                {patientName.charAt(0).toUpperCase()}
              </div>

              <div className="profile-text">
                <strong>{patientName}</strong>
                <span>Edit profile</span>
              </div>

              <span className="profile-arrow">⌄</span>
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="premium-content">
          <AnimatePresence>
            {notice && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                role="status"
                className="dashboard-notice"
              >
                <span>{notice}</span>
                <button type="button" onClick={() => setNotice("")}>
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* WELCOME */}
          <section className="welcome">
            <div className="welcome-left">
              <div className="welcome-avatar">
                {patientName.charAt(0).toUpperCase()}
              </div>

              <div>
                <span className="eyebrow">YOUR HEALTH, YOUR SPACE</span>
                <h1>Welcome, {patientName}.</h1>
                <p>
                  Manage upcoming consultations, track vitals, and view
                  prescriptions.
                </p>
              </div>
            </div>

            <div className="date-card">
              <span className="date-icon">◷</span>
              <div>
                <strong>
                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                <small>
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                  })}{" "}
                  · Today
                </small>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="stats">
            <div className="stat-card stat-blue">
              <div className="stat-top">
                <span>UPCOMING</span>
                <div>◷</div>
              </div>
              <strong>{String(upcomingAppointments.length).padStart(2, "0")}</strong>
              <p>Active appointments</p>
            </div>

            <div
              className="stat-card stat-green"
              style={{ cursor: "pointer" }}
              onClick={() => scrollToSection("health")}
            >
              <div className="stat-top">
                <span>HEALTH RECORDS</span>
                <div>♡</div>
              </div>
              <strong>{String(healthRecords.length).padStart(2, "0")}</strong>
              <p>Saved medical records</p>
            </div>

            <div
              className="stat-card stat-purple"
              style={{ cursor: "pointer" }}
              onClick={() => scrollToSection("prescriptions")}
            >
              <div className="stat-top">
                <span>PRESCRIPTIONS</span>
                <div>▣</div>
              </div>
              <strong>{String(prescriptions.length).padStart(2, "0")}</strong>
              <p>Digital prescriptions</p>
            </div>

            <div
              className="stat-card stat-dark"
              style={{ cursor: "pointer" }}
              onClick={() => setProfileModalOpen(true)}
            >
              <div className="stat-top">
                <span>BLOOD PRESSURE</span>
                <div>✦</div>
              </div>
              <strong style={{ fontSize: metrics.bloodPressure ? 22 : 30 }}>
                {metrics.bloodPressure || "Set Vitals"}
              </strong>
              <p>
                {metrics.heartRate
                  ? `HR: ${metrics.heartRate}`
                  : "Click to update vitals"}
              </p>
            </div>
          </section>

          {/* NEXT APPOINTMENT */}
          <section className="next-appointment-section">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">UPCOMING</span>
                <h2>Next appointment</h2>
                <p>Your nearest scheduled consultation at a glance.</p>
              </div>

              <Link to="/appointment" className="view-all-btn">
                + Book new appointment →
              </Link>
            </div>

            {loadingAppointments ? (
              <div className="next-appointment-card">
                Loading your appointments...
              </div>
            ) : appointmentError ? (
              <div className="next-appointment-card" role="alert">
                {appointmentError}
                <button type="button" onClick={loadDashboardData}>
                  Retry
                </button>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="next-appointment-card">
                <div className="appointment-main-info">
                  <h3>No upcoming appointments</h3>
                  <p>Book a consultation with one of our available doctors.</p>
                </div>

                <Link to="/appointment" className="view-all-btn">
                  Book appointment →
                </Link>
              </div>
            ) : (
              <div className="next-appointment-card">
                <div className="appointment-date-box">
                  <span>DATE</span>
                  <strong>
                    {new Date(upcomingAppointments[0].date).getDate() || "—"}
                  </strong>
                  <small>{formatDate(upcomingAppointments[0].date)}</small>
                </div>

                <div className="appointment-main-info">
                  <div className="doctor-profile">
                    <div className="doctor-avatar">
                      {getDoctorName(upcomingAppointments[0])
                        .replace("Dr. ", "")
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h3>{getDoctorName(upcomingAppointments[0])}</h3>
                      <p>{getDoctorSpecialty(upcomingAppointments[0])}</p>
                      <div className="doctor-meta">
                        {upcomingAppointments[0].reason || "Routine consultation"}
                      </div>
                    </div>
                  </div>

                  <div className="appointment-details">
                    <div className="appointment-detail">
                      <span className="detail-icon">◷</span>
                      <div>
                        <small>TIME</small>
                        <strong>
                          {formatSlotTime(upcomingAppointments[0].time)}
                        </strong>
                      </div>
                    </div>

                    <div className="appointment-detail">
                      <span className="detail-icon">⌖</span>
                      <div>
                        <small>LOCATION</small>
                        <strong>
                          {getDoctorLocation(upcomingAppointments[0])}
                        </strong>
                      </div>
                    </div>

                    <div className="appointment-detail">
                      <span className="detail-icon">▣</span>
                      <div>
                        <small>MODE</small>
                        <strong>
                          {upcomingAppointments[0].type || "In-Person"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="appointment-actions">
                  <span className="appointment-status">
                    <i />
                    {upcomingAppointments[0].status}
                  </span>

                  <div className="appt-inline-btns">
                    <button
                      type="button"
                      className="appt-mini-btn"
                      onClick={() => {
                        setRescheduleTarget(upcomingAppointments[0]);
                        setRescheduleDate(upcomingAppointments[0].date);
                        setRescheduleTime("");
                      }}
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      className="appt-mini-btn danger"
                      disabled={busyAction}
                      onClick={() =>
                        handleCancelAppointment(upcomingAppointments[0]._id)
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ALL APPOINTMENTS */}
          <section className="glass-section" id="appointments">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">YOUR ACTIVITY</span>
                <h2>Appointments ({filteredAppointments.length})</h2>
              </div>

              <div className="status-filter-pills">
                {["all", "pending", "approved", "completed", "cancelled"].map(
                  (st) => (
                    <button
                      type="button"
                      key={st}
                      className={statusFilter === st ? "active" : ""}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {loadingAppointments ? (
              <p>Loading appointments...</p>
            ) : filteredAppointments.length === 0 ? (
              <p>No appointments match this filter.</p>
            ) : (
              <div className="appointment-list">
                <div className="appointment-row heading">
                  <span>DOCTOR</span>
                  <span>DATE &amp; TIME</span>
                  <span>STATUS</span>
                  <span>ACTIONS</span>
                </div>

                {filteredAppointments.map((appointment) => {
                  const st = String(appointment.status || "pending").toLowerCase();
                  const canModify = ["pending", "approved"].includes(st);
                  const hasRx =
                    appointment.prescription &&
                    ((appointment.prescription.medications &&
                      appointment.prescription.medications.length > 0) ||
                      appointment.prescription.advice);

                  return (
                    <div className="appointment-row" key={appointment._id}>
                      <div className="doctor-cell">
                        <div className="mini-avatar blue-avatar">
                          {getDoctorName(appointment)
                            .replace("Dr. ", "")
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{getDoctorName(appointment)}</strong>
                          <small>
                            {getDoctorSpecialty(appointment)} ·{" "}
                            {appointment.type || "In-Person"}
                          </small>
                        </div>
                      </div>

                      <span>
                        {formatDate(appointment.date)}
                        <small>{formatSlotTime(appointment.time)}</small>
                      </span>

                      <b className={`badge ${st}`}>{st}</b>

                      <div className="appt-inline-btns">
                        {canModify && (
                          <>
                            <button
                              type="button"
                              className="appt-mini-btn"
                              onClick={() => {
                                setRescheduleTarget(appointment);
                                setRescheduleDate(appointment.date);
                                setRescheduleTime("");
                              }}
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              className="appt-mini-btn danger"
                              disabled={busyAction}
                              onClick={() =>
                                handleCancelAppointment(appointment._id)
                              }
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {hasRx && (
                          <button
                            type="button"
                            className="appt-mini-btn primary"
                            onClick={() => setPrescriptionModal(appointment)}
                          >
                            View Rx
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* BOTTOM GRID: HEALTH VITALS & QUICK ACCESS */}
          <div className="bottom-grid">
            <section className="glass-section health-section" id="health">
              <div className="section-header">
                <div>
                  <span className="section-eyebrow">WELLNESS &amp; VITALS</span>
                  <h2>Health records</h2>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className="appt-mini-btn"
                    onClick={() => setProfileModalOpen(true)}
                  >
                    Edit Vitals
                  </button>
                  <button
                    type="button"
                    className="appt-mini-btn primary"
                    onClick={() => setRecordModalOpen(true)}
                  >
                    + Add Record
                  </button>
                </div>
              </div>

              <div className="vitals-mini-grid">
                <div>
                  <small>Blood Pressure</small>
                  <strong>{metrics.bloodPressure || "—"}</strong>
                </div>
                <div>
                  <small>Heart Rate</small>
                  <strong>{metrics.heartRate || "—"}</strong>
                </div>
                <div>
                  <small>Blood Sugar</small>
                  <strong>{metrics.bloodSugar || "—"}</strong>
                </div>
                <div>
                  <small>Blood Group</small>
                  <strong>{user?.bloodGroup || "—"}</strong>
                </div>
              </div>

              {healthRecords.length === 0 ? (
                <p>No medical records added yet. Click "+ Add Record" to store lab results or reports.</p>
              ) : (
                <div className="records-list">
                  {healthRecords.map((rec) => (
                    <div key={rec._id} className="record-item">
                      <div>
                        <strong>{rec.title}</strong>
                        <small>
                          {rec.category} · {formatDate(rec.date)} · {rec.provider}
                        </small>
                        {rec.summary && <p>{rec.summary}</p>}
                      </div>
                      <button
                        type="button"
                        className="appt-mini-btn danger"
                        onClick={() => handleDeleteRecord(rec._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* QUICK ACTIONS */}
            <section className="glass-section quick-section">
              <div className="section-header">
                <div>
                  <span className="section-eyebrow">QUICK ACCESS</span>
                  <h2>What do you need?</h2>
                </div>
              </div>

              <div className="quick-grid">
                <Link to="/appointment">
                  <span>＋</span>
                  Book appointment
                </Link>

                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                >
                  <span>♡</span>
                  Profile &amp; vitals
                </button>

                <button
                  type="button"
                  onClick={() => setRecordModalOpen(true)}
                >
                  <span>▣</span>
                  Add health record
                </button>

                <button type="button" onClick={() => navigate("/medi-ai")}>
                  <span>✦</span>
                  AI assistant
                </button>
              </div>
            </section>
          </div>

          {/* PRESCRIPTIONS */}
          <section id="prescriptions" className="glass-section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">MEDICATIONS</span>
                <h2>Digital Prescriptions ({prescriptions.length})</h2>
              </div>
            </div>

            {prescriptions.length === 0 ? (
              <p>
                No digital prescriptions issued yet. Completed consultations with
                prescribed medications will appear here automatically.
              </p>
            ) : (
              <div className="prescriptions-grid">
                {prescriptions.map((item) => (
                  <div key={item._id} className="rx-card">
                    <div className="rx-card-head">
                      <div>
                        <strong>{getDoctorName(item)}</strong>
                        <small>
                          {getDoctorSpecialty(item)} · {formatDate(item.date)}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="appt-mini-btn primary"
                        onClick={() => setPrescriptionModal(item)}
                      >
                        Open / Print
                      </button>
                    </div>
                    <ul className="rx-med-preview">
                      {(item.prescription?.medications || []).map((m, idx) => (
                        <li key={idx}>
                          <strong>{m.name}</strong> — {m.dosage} ({m.duration})
                        </li>
                      ))}
                    </ul>
                    {item.prescription?.advice && (
                      <p className="rx-advice">{item.prescription.advice}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* MY DOCTORS */}
          <section className="my-doctors-section" id="doctors">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">YOUR CARE TEAM</span>
                <h2>Available Doctors</h2>
                <p>Book a consultation directly with any specialist.</p>
              </div>

              <Link to="/appointment" className="view-all-btn">
                All specialists →
              </Link>
            </div>

            {loadingDoctors ? (
              <p>Loading doctors...</p>
            ) : doctorError ? (
              <p role="alert">{doctorError}</p>
            ) : filteredDoctors.length === 0 ? (
              <p>No doctors match your search.</p>
            ) : (
              <div className="my-doctors-grid">
                {filteredDoctors.slice(0, 6).map((doctor, index) => (
                  <div
                    className="my-doctor-card"
                    key={doctor._id || index}
                  >
                    <div
                      className={`my-doctor-avatar ${
                        ["blue", "green", "purple"][index % 3]
                      }`}
                    >
                      {(doctor.name || "Dr")
                        .replace("Dr. ", "")
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="my-doctor-info">
                      <h3>{doctor.name}</h3>
                      <p>{doctor.specialty}</p>
                      <div className="doctor-rating">
                        {formatExperience(doctor.experience)} · {doctor.location} · ₹
                        {doctor.consultationFee || 600}
                      </div>
                    </div>

                    <Link
                      to={`/appointment?doctorId=${doctor._id}`}
                      className="doctor-book-btn"
                    >
                      Book
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* AI */}
          <section className="ai-card" id="ai">
            <div className="ai-symbol">✦</div>

            <div className="ai-content">
              <span>MEDICARE INTELLIGENCE</span>
              <h2>Your personal health assistant.</h2>
              <p>
                Ask general health questions, prepare for appointments, and
                get instant guidance from MediAI.
              </p>
            </div>

            <button type="button" onClick={() => navigate("/medi-ai")}>
              Explore MediCare AI →
            </button>
          </section>

          {/* FOOTER */}
          <footer className="dashboard-footer">
            <span>© {new Date().getFullYear()} MediCare</span>
            <span>Private · Secure · Connected Healthcare</span>
          </footer>
        </div>
      </main>

      {/* PROFILE & VITALS MODAL */}
      <AnimatePresence>
        {profileModalOpen && (
          <motion.div
            className="dash-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setProfileModalOpen(false)}
          >
            <motion.div
              className="dash-modal-card"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dash-modal-head">
                <h3>Patient Profile &amp; Health Vitals</h3>
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                >
                  ×
                </button>
              </div>

              <form className="dash-modal-form" onSubmit={handleProfileSave}>
                <div className="dash-form-grid">
                  <label>
                    Full Name
                    <input
                      required
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phone: e.target.value })
                      }
                      placeholder="+91 ..."
                    />
                  </label>
                  <label>
                    Age
                    <input
                      type="number"
                      min="0"
                      max="130"
                      value={profileForm.age}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, age: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Blood Group
                    <select
                      value={profileForm.bloodGroup}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          bloodGroup: e.target.value,
                        })
                      }
                    >
                      <option value="">Select</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                  <label>
                    Blood Pressure
                    <input
                      value={profileForm.bloodPressure}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          bloodPressure: e.target.value,
                        })
                      }
                      placeholder="120/80 mmHg"
                    />
                  </label>
                  <label>
                    Heart Rate
                    <input
                      value={profileForm.heartRate}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          heartRate: e.target.value,
                        })
                      }
                      placeholder="72 bpm"
                    />
                  </label>
                  <label>
                    Blood Sugar
                    <input
                      value={profileForm.bloodSugar}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          bloodSugar: e.target.value,
                        })
                      }
                      placeholder="95 mg/dL"
                    />
                  </label>
                  <label>
                    Weight
                    <input
                      value={profileForm.weight}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, weight: e.target.value })
                      }
                      placeholder="65 kg"
                    />
                  </label>
                </div>

                <label>
                  Known Allergies
                  <input
                    value={profileForm.allergies}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        allergies: e.target.value,
                      })
                    }
                    placeholder="e.g. Penicillin, Dust"
                  />
                </label>

                <label>
                  Emergency Contact
                  <input
                    value={profileForm.emergencyContact}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        emergencyContact: e.target.value,
                      })
                    }
                    placeholder="Name & phone number"
                  />
                </label>

                <button
                  type="submit"
                  className="dash-modal-submit"
                  disabled={busyAction}
                >
                  {busyAction ? "Saving..." : "Save Profile & Vitals"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD HEALTH RECORD MODAL */}
      <AnimatePresence>
        {recordModalOpen && (
          <motion.div
            className="dash-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRecordModalOpen(false)}
          >
            <motion.div
              className="dash-modal-card"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dash-modal-head">
                <h3>Add Health Record</h3>
                <button type="button" onClick={() => setRecordModalOpen(false)}>
                  ×
                </button>
              </div>
              <form className="dash-modal-form" onSubmit={handleAddRecord}>
                <label>
                  Record Title
                  <input
                    required
                    value={recordForm.title}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, title: e.target.value })
                    }
                    placeholder="e.g. Complete Blood Count (CBC)"
                  />
                </label>
                <div className="dash-form-grid">
                  <label>
                    Category
                    <select
                      value={recordForm.category}
                      onChange={(e) =>
                        setRecordForm({
                          ...recordForm,
                          category: e.target.value,
                        })
                      }
                    >
                      <option value="Lab Report">Lab Report</option>
                      <option value="Vitals">Vitals</option>
                      <option value="Imaging">Imaging</option>
                      <option value="Vaccination">Vaccination</option>
                      <option value="Checkup">Checkup</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label>
                    Date
                    <input
                      type="date"
                      required
                      value={recordForm.date}
                      onChange={(e) =>
                        setRecordForm({ ...recordForm, date: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label>
                  Clinic / Lab Name
                  <input
                    value={recordForm.provider}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, provider: e.target.value })
                    }
                  />
                </label>
                <label>
                  Summary / Findings
                  <textarea
                    rows={3}
                    value={recordForm.summary}
                    onChange={(e) =>
                      setRecordForm({ ...recordForm, summary: e.target.value })
                    }
                    placeholder="Key observations or test notes..."
                  />
                </label>
                <button
                  type="submit"
                  className="dash-modal-submit"
                  disabled={busyAction}
                >
                  {busyAction ? "Saving..." : "Save Health Record"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESCHEDULE MODAL */}
      <AnimatePresence>
        {rescheduleTarget && (
          <motion.div
            className="dash-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRescheduleTarget(null)}
          >
            <motion.div
              className="dash-modal-card"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dash-modal-head">
                <h3>Reschedule with {getDoctorName(rescheduleTarget)}</h3>
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                >
                  ×
                </button>
              </div>
              <form className="dash-modal-form" onSubmit={handleRescheduleSubmit}>
                <label>
                  New Date
                  <input
                    type="date"
                    required
                    min={getTodayMinDate()}
                    value={rescheduleDate}
                    onChange={(e) => {
                      setRescheduleDate(e.target.value);
                      setRescheduleTime("");
                    }}
                  />
                </label>
                <label>
                  Available Slots
                  <select
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                  >
                    <option value="">Choose new slot</option>
                    {rescheduleSlots.map((s) => (
                      <option
                        key={s.time}
                        value={s.time}
                        disabled={!s.available}
                      >
                        {formatSlotTime(s.time)}{" "}
                        {s.available ? "" : "(Booked)"}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className="dash-modal-submit"
                  disabled={busyAction || !rescheduleTime}
                >
                  {busyAction ? "Updating..." : "Confirm New Slot"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRESCRIPTION DETAIL & PRINT MODAL */}
      <AnimatePresence>
        {prescriptionModal && (
          <motion.div
            className="dash-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPrescriptionModal(null)}
          >
            <motion.div
              className="dash-modal-card"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dash-modal-head">
                <div>
                  <span className="section-eyebrow">MEDICARE E-PRESCRIPTION</span>
                  <h3>{getDoctorName(prescriptionModal)}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPrescriptionModal(null)}
                >
                  ×
                </button>
              </div>
              <div className="rx-modal-body">
                <p>
                  <strong>Patient:</strong> {patientName} ·{" "}
                  <strong>Date:</strong> {formatDate(prescriptionModal.date)}
                </p>
                {prescriptionModal.notes && (
                  <p>
                    <strong>Clinical Notes:</strong> {prescriptionModal.notes}
                  </p>
                )}
                <h4>Prescribed Medications</h4>
                <ul>
                  {(prescriptionModal.prescription?.medications || []).map(
                    (m, i) => (
                      <li key={i}>
                        <strong>{m.name}</strong> — {m.dosage} · {m.duration} (
                        {m.instructions})
                      </li>
                    )
                  )}
                </ul>
                {prescriptionModal.prescription?.advice && (
                  <p>
                    <strong>Doctor's Advice:</strong>{" "}
                    {prescriptionModal.prescription.advice}
                  </p>
                )}
                <button
                  type="button"
                  className="dash-modal-submit"
                  onClick={() => window.print()}
                >
                  Print / Save PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUPPORT MODAL */}
      <AnimatePresence>
        {supportModalOpen && (
          <motion.div
            className="dash-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSupportModalOpen(false)}
          >
            <motion.div
              className="dash-modal-card"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dash-modal-head">
                <h3>Contact MediCare Support</h3>
                <button
                  type="button"
                  onClick={() => setSupportModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <form className="dash-modal-form" onSubmit={handleSupportSubmit}>
                <label>
                  Subject
                  <select
                    value={supportForm.subject}
                    onChange={(e) =>
                      setSupportForm({ ...supportForm, subject: e.target.value })
                    }
                  >
                    <option value="Appointment Help">Appointment Help</option>
                    <option value="Prescription Inquiry">
                      Prescription Inquiry
                    </option>
                    <option value="Account Support">Account Support</option>
                  </select>
                </label>
                <label>
                  Message
                  <textarea
                    required
                    rows={4}
                    value={supportForm.message}
                    onChange={(e) =>
                      setSupportForm({ ...supportForm, message: e.target.value })
                    }
                    placeholder="Tell us how we can help..."
                  />
                </label>
                <button
                  type="submit"
                  className="dash-modal-submit"
                  disabled={busyAction}
                >
                  {busyAction ? "Sending..." : "Submit Support Request"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;
