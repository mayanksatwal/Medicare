import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Home,
  LogOut,
  Plus,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { useAuthConfig } from "../main.jsx";
import {
  API_URL,
  clearSession,
  formatSlotTime,
  getToken,
} from "../utils/api.js";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { demoVerifyEnabled } = useAuthConfig();

  const [doctorUser, setDoctorUser] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updating, setUpdating] = useState("");

  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [rxModalTarget, setRxModalTarget] = useState(null);
  const [rxNotes, setRxNotes] = useState("");
  const [rxAdvice, setRxAdvice] = useState("");
  const [rxMeds, setRxMeds] = useState([
    { name: "", dosage: "", duration: "5 days", instructions: "After meals" },
  ]);

  const [profileForm, setProfileForm] = useState({
    name: "",
    specialty: "",
    qualification: "",
    experience: "",
    location: "",
    consultationFee: "600",
    bio: "",
  });

  const showToast = (msg) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice((cur) => (cur === msg ? "" : cur));
    }, 4000);
  };

  const loadDashboard = useCallback(async () => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profileResponse = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = await profileResponse.json();
      if (!profileResponse.ok) {
        throw new Error(profileData.message || "Could not verify your account.");
      }

      const currentUser = profileData.user || profileData;
      setDoctorUser(currentUser);
      if (profileData.doctorProfile) {
        setDoctorProfile(profileData.doctorProfile);
        setProfileForm({
          name: profileData.doctorProfile.name || currentUser.name || "",
          specialty: profileData.doctorProfile.specialty || "",
          qualification: profileData.doctorProfile.qualification || "",
          experience: profileData.doctorProfile.experience || "",
          location: profileData.doctorProfile.location || "",
          consultationFee: String(
            profileData.doctorProfile.consultationFee ?? 600
          ),
          bio: profileData.doctorProfile.bio || "",
        });
      }

      if (currentUser.role !== "doctor") {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (currentUser.doctorVerificationStatus !== "approved") {
        setAppointments([]);
        return;
      }

      const appointmentResponse = await fetch(
        `${API_URL}/api/doctor/appointments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const appointmentData = await appointmentResponse.json();
      if (!appointmentResponse.ok) {
        throw new Error(
          appointmentData.message || "Could not load appointments."
        );
      }

      setAppointments(appointmentData.appointments || []);
      if (appointmentData.doctor) {
        setDoctorProfile(appointmentData.doctor);
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleDemoVerify = async () => {
    const token = getToken();
    setUpdating("verify");
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/doctor/verify-demo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed.");
      showToast("Doctor account verified and listed in the directory!");
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating("");
    }
  };

  const toggleAvailability = async () => {
    const token = getToken();
    const nextValue = !(doctorProfile?.isAvailable ?? false);
    setUpdating("availability");
    try {
      const res = await fetch(`${API_URL}/api/doctor/availability`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable: nextValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed.");
      setDoctorProfile(data.doctor);
      showToast(
        nextValue
          ? "You are now visible as Available for bookings."
          : "You are now marked Unavailable."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating("");
    }
  };

  const updateAppointment = async (id, payload) => {
    const token = getToken();
    setUpdating(id);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/doctor/appointments/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not update appointment.");
      }

      showToast("Appointment updated successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating("");
    }
  };

  const openPrescriptionModal = (appointment) => {
    setRxModalTarget(appointment);
    setRxNotes(appointment.notes || "");
    setRxAdvice(appointment.prescription?.advice || "");
    const existingMeds = appointment.prescription?.medications || [];
    setRxMeds(
      existingMeds.length > 0
        ? existingMeds
        : [
            {
              name: "",
              dosage: "",
              duration: "5 days",
              instructions: "After meals",
            },
          ]
    );
  };

  const handleSavePrescription = async (e) => {
    e.preventDefault();
    if (!rxModalTarget) return;
    await updateAppointment(rxModalTarget._id, {
      status: "completed",
      notes: rxNotes,
      prescription: {
        medications: rxMeds.filter((m) => m.name.trim() && m.dosage.trim()),
        advice: rxAdvice,
      },
    });
    setRxModalTarget(null);
  };

  const handleSaveDoctorProfile = async (e) => {
    e.preventDefault();
    const token = getToken();
    setUpdating("profile");
    try {
      const res = await fetch(`${API_URL}/api/doctor/profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profileForm,
          consultationFee: Number(profileForm.consultationFee) || 600,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed.");
      setDoctorProfile(data.doctor);
      if (data.user) setDoctorUser(data.user);
      setProfileModalOpen(false);
      showToast("Doctor profile updated!");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating("");
    }
  };

  const logout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "all") return appointments;
    return appointments.filter((a) => a.status === statusFilter);
  }, [appointments, statusFilter]);

  if (loading) {
    return (
      <div style={styles.center}>
        <Activity size={30} color="#2563eb" />
        <p>Loading Doctor Portal...</p>
      </div>
    );
  }

  if (!doctorUser) {
    return (
      <div style={styles.center}>
        <p>{error || "Unable to load your account."}</p>
        <button style={styles.primaryButton} onClick={loadDashboard}>
          Try again
        </button>
      </div>
    );
  }

  if (doctorUser.doctorVerificationStatus !== "approved") {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <div style={styles.brand}>
            <Activity size={24} color="#38bdf8" />
            <span>MediCare</span>
            <small style={styles.portalTag}>Doctor Portal</small>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/" style={styles.headerBtn}>
              <Home size={15} /> Home
            </Link>
            <button style={styles.headerBtn} onClick={logout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </header>

        <main style={styles.centerCardWrap}>
          <div style={styles.pendingCard}>
            <Stethoscope size={44} color="#2563eb" />
            <h2>Doctor Verification Pending</h2>
            <p>
              Welcome, <strong>{doctorUser.name}</strong>. Your specialist
              profile ({doctorProfile?.specialty || "Doctor"}) must be verified
              before you appear in the patient directory and receive bookings.
            </p>
            <p style={{ fontSize: 13, color: "#64748b" }}>
              Status:{" "}
              <strong style={{ color: "#b45309" }}>
                {doctorUser.doctorVerificationStatus}
              </strong>
            </p>

            {error && <div style={styles.error}>{error}</div>}

            <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
              {demoVerifyEnabled && (
                <button
                  style={styles.primaryButton}
                  disabled={updating === "verify"}
                  onClick={handleDemoVerify}
                >
                  <ShieldCheck size={16} />
                  {updating === "verify"
                    ? "Verifying..."
                    : "Activate Instant Verification"}
                </button>
              )}

              <button style={styles.secondaryButton} onClick={loadDashboard}>
                <RefreshCw size={16} /> Refresh Status
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const pending = appointments.filter((a) => a.status === "pending").length;
  const approved = appointments.filter((a) => a.status === "approved").length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const isAvailable = Boolean(doctorProfile?.isAvailable);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <Activity size={24} color="#38bdf8" />
          <span>MediCare</span>
          <small style={styles.portalTag}>Doctor Portal</small>
        </div>

        <div style={styles.headerActions}>
          <Link to="/" style={styles.headerBtn}>
            <Home size={15} /> Home
          </Link>
          <Link to="/medi-ai" style={styles.headerBtn}>
            <Sparkles size={15} /> MediAI
          </Link>
          <button
            style={styles.headerBtn}
            onClick={() => setProfileModalOpen(true)}
          >
            <Settings size={15} /> Edit Profile
          </button>
          <button style={styles.headerBtn} onClick={logout}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={styles.toast}
            >
              {notice}
            </motion.div>
          )}
        </AnimatePresence>

        <section style={styles.welcome}>
          <div>
            <p style={styles.eyebrow}>VERIFIED SPECIALIST PORTAL</p>
            <h1 style={{ margin: "6px 0" }}>
              Welcome, {doctorUser.name}
            </h1>
            <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
              {doctorProfile?.specialty} · {doctorProfile?.location} · Consultation Fee: ₹
              {doctorProfile?.consultationFee ?? 600}
            </p>
          </div>

          <button
            disabled={updating === "availability"}
            onClick={toggleAvailability}
            style={{
              ...styles.availabilityBtn,
              background: isAvailable ? "#dcfce7" : "#fee2e2",
              color: isAvailable ? "#166534" : "#991b1b",
            }}
          >
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: isAvailable ? "#16a34a" : "#dc2626",
              }}
            />
            {isAvailable ? "Available for Bookings" : "Currently Unavailable"}
          </button>
        </section>

        {error && <div style={styles.error}>{error}</div>}

        <section style={styles.stats}>
          <StatCard
            title="Total Appointments"
            value={appointments.length}
            icon={<CalendarDays size={22} />}
          />
          <StatCard
            title="Pending Requests"
            value={pending}
            icon={<Clock size={22} />}
          />
          <StatCard
            title="Approved Visits"
            value={approved}
            icon={<CheckCircle size={22} />}
          />
          <StatCard
            title="Completed"
            value={completed}
            icon={<FileText size={22} />}
          />
        </section>

        <section style={styles.panel}>
          <div style={styles.sectionHeading}>
            <div>
              <h2 style={{ margin: 0 }}>Patient Appointments</h2>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
                Approve visits, add clinical notes, and issue digital prescriptions.
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["all", "pending", "approved", "completed", "rejected"].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      ...styles.filterPill,
                      background: statusFilter === st ? "#2563eb" : "#f1f5f9",
                      color: statusFilter === st ? "white" : "#475569",
                    }}
                  >
                    {st}
                  </button>
                )
              )}
              <button style={styles.secondaryButton} onClick={loadDashboard}>
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div style={styles.empty}>
              <CalendarDays size={34} />
              <h3>No appointments in this view</h3>
              <p>Patient booking requests will appear here automatically.</p>
            </div>
          ) : (
            <div style={styles.appointmentGrid}>
              {filteredAppointments.map((appointment) => {
                const patient = appointment.patient || {};
                const st = appointment.status || "pending";

                return (
                  <article key={appointment._id} style={styles.card}>
                    <div style={styles.cardHead}>
                      <div style={styles.patientRow}>
                        <div style={styles.avatar}>
                          <UserRound size={20} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 15 }}>
                            {patient.name || "Patient"}
                          </h3>
                          <small style={{ color: "#64748b" }}>
                            {patient.email}
                          </small>
                        </div>
                      </div>
                      <span
                        style={{
                          ...styles.badge,
                          ...(styles[st] || styles.pending),
                        }}
                      >
                        {st}
                      </span>
                    </div>

                    <div style={styles.metaGrid}>
                      <span>
                        <CalendarDays size={14} /> {appointment.date}
                      </span>
                      <span>
                        <Clock size={14} /> {formatSlotTime(appointment.time)}
                      </span>
                      <span>Mode: {appointment.type || "In-Person"}</span>
                      {patient.bloodGroup && (
                        <span>Blood: {patient.bloodGroup}</span>
                      )}
                    </div>

                    {appointment.reason && (
                      <p style={styles.reason}>
                        <strong>Reason:</strong> {appointment.reason}
                      </p>
                    )}

                    {patient.allergies && (
                      <p style={styles.reason}>
                        <strong>Allergies:</strong> {patient.allergies}
                      </p>
                    )}

                    {appointment.prescription?.medications?.length > 0 && (
                      <p style={styles.rxSummary}>
                        ✓ Prescription issued (
                        {appointment.prescription.medications.length}{" "}
                        medications)
                      </p>
                    )}

                    <div style={styles.actions}>
                      {st === "pending" && (
                        <>
                          <button
                            style={styles.approveBtn}
                            disabled={updating === appointment._id}
                            onClick={() =>
                              updateAppointment(appointment._id, {
                                status: "approved",
                              })
                            }
                          >
                            <CheckCircle size={15} /> Approve
                          </button>
                          <button
                            style={styles.rejectBtn}
                            disabled={updating === appointment._id}
                            onClick={() =>
                              updateAppointment(appointment._id, {
                                status: "rejected",
                              })
                            }
                          >
                            <XCircle size={15} /> Reject
                          </button>
                        </>
                      )}

                      {st === "approved" && (
                        <button
                          style={styles.completeBtn}
                          disabled={updating === appointment._id}
                          onClick={() => openPrescriptionModal(appointment)}
                        >
                          <FileText size={15} /> Complete &amp; Write Rx
                        </button>
                      )}

                      {st === "completed" && (
                        <button
                          style={styles.secondaryButton}
                          onClick={() => openPrescriptionModal(appointment)}
                        >
                          <FileText size={15} /> Edit Notes / Rx
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* PRESCRIPTION & NOTES MODAL */}
      <AnimatePresence>
        {rxModalTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setRxModalTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              style={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHead}>
                <h3 style={{ margin: 0 }}>
                  Consultation Notes &amp; Prescription —{" "}
                  {rxModalTarget.patient?.name}
                </h3>
                <button
                  style={styles.closeBtn}
                  onClick={() => setRxModalTarget(null)}
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleSavePrescription}
                style={{ display: "grid", gap: 12 }}
              >
                <label style={styles.label}>
                  Clinical Notes
                  <textarea
                    rows={2}
                    style={styles.input}
                    value={rxNotes}
                    onChange={(e) => setRxNotes(e.target.value)}
                    placeholder="Observations & diagnosis summary..."
                  />
                </label>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <strong style={{ fontSize: 13 }}>Medications</strong>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() =>
                        setRxMeds((prev) => [
                          ...prev,
                          {
                            name: "",
                            dosage: "",
                            duration: "5 days",
                            instructions: "After meals",
                          },
                        ])
                      }
                    >
                      <Plus size={14} /> Add Medicine
                    </button>
                  </div>

                  {rxMeds.map((med, idx) => (
                    <div key={idx} style={styles.medRow}>
                      <input
                        style={styles.input}
                        placeholder="Medicine name"
                        value={med.name}
                        onChange={(e) => {
                          const copy = [...rxMeds];
                          copy[idx].name = e.target.value;
                          setRxMeds(copy);
                        }}
                      />
                      <input
                        style={styles.input}
                        placeholder="Dosage (e.g. 1 tab twice daily)"
                        value={med.dosage}
                        onChange={(e) => {
                          const copy = [...rxMeds];
                          copy[idx].dosage = e.target.value;
                          setRxMeds(copy);
                        }}
                      />
                      <input
                        style={styles.input}
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => {
                          const copy = [...rxMeds];
                          copy[idx].duration = e.target.value;
                          setRxMeds(copy);
                        }}
                      />
                      {rxMeds.length > 1 && (
                        <button
                          type="button"
                          style={styles.iconDangerBtn}
                          onClick={() =>
                            setRxMeds(rxMeds.filter((_, i) => i !== idx))
                          }
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <label style={styles.label}>
                  Patient Advice
                  <textarea
                    rows={2}
                    style={styles.input}
                    value={rxAdvice}
                    onChange={(e) => setRxAdvice(e.target.value)}
                    placeholder="Rest, hydration, follow-up instructions..."
                  />
                </label>

                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={updating === rxModalTarget._id}
                >
                  Save &amp; Mark Completed
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT DOCTOR PROFILE MODAL */}
      <AnimatePresence>
        {profileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.modalOverlay}
            onClick={() => setProfileModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              style={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={styles.modalHead}>
                <h3 style={{ margin: 0 }}>Edit Doctor Profile</h3>
                <button
                  style={styles.closeBtn}
                  onClick={() => setProfileModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <form
                onSubmit={handleSaveDoctorProfile}
                style={{ display: "grid", gap: 11 }}
              >
                <label style={styles.label}>
                  Full Name
                  <input
                    required
                    style={styles.input}
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                  />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label style={styles.label}>
                    Specialty
                    <input
                      required
                      style={styles.input}
                      value={profileForm.specialty}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          specialty: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label style={styles.label}>
                    Qualification
                    <input
                      style={styles.input}
                      value={profileForm.qualification}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          qualification: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label style={styles.label}>
                    Experience
                    <input
                      style={styles.input}
                      value={profileForm.experience}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          experience: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label style={styles.label}>
                    Consultation Fee (₹)
                    <input
                      type="number"
                      min="0"
                      style={styles.input}
                      value={profileForm.consultationFee}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          consultationFee: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>
                <label style={styles.label}>
                  Location
                  <input
                    required
                    style={styles.input}
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        location: e.target.value,
                      })
                    }
                  />
                </label>
                <label style={styles.label}>
                  Bio
                  <textarea
                    rows={3}
                    style={styles.input}
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                  />
                </label>
                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={updating === "profile"}
                >
                  {updating === "profile" ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{title}</p>
        <h2 style={{ margin: "4px 0 0", fontSize: 26 }}>{value}</h2>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f8ff",
    color: "#172033",
    fontFamily: "Inter, Arial, sans-serif",
  },
  center: {
    minHeight: "100vh",
    display: "grid",
    placeContent: "center",
    gap: 12,
    textAlign: "center",
  },
  centerCardWrap: {
    padding: "48px 20px",
    display: "flex",
    justifyContent: "center",
  },
  pendingCard: {
    background: "white",
    padding: 36,
    borderRadius: 18,
    maxWidth: 480,
    textAlign: "center",
    boxShadow: "0 12px 32px rgba(15, 35, 70, 0.08)",
  },
  header: {
    background: "#101d3a",
    color: "white",
    padding: "16px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 20,
    fontWeight: 800,
  },
  portalTag: {
    fontSize: 11,
    padding: "3px 9px",
    borderRadius: 999,
    background: "rgba(56, 189, 248, 0.2)",
    color: "#7dd3fc",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  headerBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 13px",
    borderRadius: 9,
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    fontSize: 12,
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
  },
  main: {
    maxWidth: 1180,
    margin: "32px auto",
    padding: "0 20px 50px",
  },
  toast: {
    marginBottom: 18,
    padding: "12px 16px",
    borderRadius: 12,
    background: "#ecfdf3",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: 13,
    fontWeight: 600,
  },
  welcome: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 18,
    marginBottom: 24,
  },
  eyebrow: {
    color: "#2563eb",
    fontWeight: 800,
    letterSpacing: 1.5,
    fontSize: 11,
    margin: 0,
  },
  availabilityBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 9,
    border: 0,
    padding: "12px 18px",
    borderRadius: 11,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    background: "white",
    padding: 20,
    borderRadius: 15,
    display: "flex",
    alignItems: "center",
    gap: 15,
    border: "1px solid #e7edf6",
    boxShadow: "0 4px 16px rgba(15, 35, 70, 0.04)",
  },
  statIcon: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: 13,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
  },
  panel: {
    background: "white",
    padding: 24,
    borderRadius: 18,
    border: "1px solid #e7edf6",
    boxShadow: "0 6px 22px rgba(15, 35, 70, 0.04)",
  },
  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  filterPill: {
    border: 0,
    borderRadius: 999,
    padding: "7px 13px",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "capitalize",
    cursor: "pointer",
  },
  appointmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
    gap: 16,
  },
  card: {
    border: "1px solid #e6edf6",
    borderRadius: 14,
    padding: 18,
    background: "#fbfdff",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  patientRow: {
    display: "flex",
    alignItems: "center",
    gap: 11,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#2563eb",
    display: "grid",
    placeItems: "center",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "capitalize",
  },
  pending: { background: "#fef3c7", color: "#92400e" },
  approved: { background: "#dcfce7", color: "#166534" },
  rejected: { background: "#fee2e2", color: "#991b1b" },
  completed: { background: "#dbeafe", color: "#1e40af" },
  cancelled: { background: "#e5e7eb", color: "#374151" },
  metaGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 12,
    color: "#475569",
  },
  reason: {
    margin: 0,
    fontSize: 13,
    color: "#334155",
  },
  rxSummary: {
    margin: 0,
    fontSize: 12,
    color: "#15803d",
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: "auto",
  },
  approveBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#16a34a",
    color: "white",
    border: 0,
    padding: "9px 14px",
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  rejectBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#dc2626",
    color: "white",
    border: 0,
    padding: "9px 14px",
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  completeBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#2563eb",
    color: "white",
    border: 0,
    padding: "9px 14px",
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "#2563eb",
    color: "white",
    border: 0,
    padding: "11px 16px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: "white",
    color: "#1e293b",
    border: "1px solid #cbd5e1",
    padding: "8px 13px",
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    padding: 40,
    color: "#64748b",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 13,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 900,
    background: "rgba(10, 22, 42, 0.55)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "white",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 25px 60px rgba(10, 28, 56, 0.24)",
  },
  modalHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontSize: 18,
    cursor: "pointer",
  },
  label: {
    display: "grid",
    gap: 5,
    fontSize: 12,
    fontWeight: 700,
    color: "#334155",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 9,
    border: "1px solid #cbd5e1",
    fontSize: 13,
    fontFamily: "inherit",
  },
  medRow: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1.2fr 0.8fr auto",
    gap: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  iconDangerBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#dc2626",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
  },
};
