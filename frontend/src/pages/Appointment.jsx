import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  CalendarDays,
  Clock3,
  MapPin,
  CheckCircle2,
  Video,
  Building2,
  ArrowRight,
} from "lucide-react";
import {
  API_URL,
  formatExperience,
  formatSlotTime,
  getStoredUser,
  getTodayMinDate,
  getToken,
} from "../utils/api.js";
import "./Appointment.css";

function Appointment() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = getToken();
  const storedUser = getStoredUser();
  const patientName = storedUser?.name || "Patient";

  const initialDoctorId =
    location.state?.doctorId || searchParams.get("doctorId") || "";

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(initialDoctorId);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  const [date, setDate] = useState(getTodayMinDate());
  const [time, setTime] = useState("");
  const [visitType, setVisitType] = useState("In-Person");
  const [reason, setReason] = useState("");

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Restore draft booking if redirected from homepage booking form
  useEffect(() => {
    try {
      const draftRaw = sessionStorage.getItem("pendingBooking");
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        if (draft.doctorId && !initialDoctorId) setDoctorId(draft.doctorId);
        if (draft.date) setDate(draft.date);
        if (draft.time) setTime(draft.time);
        if (draft.type) setVisitType(draft.type);
        if (draft.reason) setReason(draft.reason);
        sessionStorage.removeItem("pendingBooking");
      }
    } catch {
      // ignore
    }
  }, [initialDoctorId]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${API_URL}/api/doctors`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load doctors.");
        }

        setDoctors(data.doctors || []);
      } catch (err) {
        setError(err.message || "Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch live slot availability when doctor or date changes
  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }

    let active = true;
    setSlotsLoading(true);
    fetch(`${API_URL}/api/doctors/${doctorId}/slots?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const list = data.slots || [];
        setSlots(list);
        if (time && list.some((s) => s.time === time && !s.available)) {
          setTime("");
        }
      })
      .catch(() => {
        if (active) setSlots([]);
      })
      .finally(() => {
        if (active) setSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [doctorId, date]);

  const specialties = useMemo(() => {
    const unique = new Set(doctors.map((d) => d.specialty).filter(Boolean));
    return ["All", ...unique];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSpec =
        specialtyFilter === "All" || doctor.specialty === specialtyFilter;
      const query = search.trim().toLowerCase();
      const matchesQuery =
        !query ||
        `${doctor.name} ${doctor.specialty} ${doctor.location}`
          .toLowerCase()
          .includes(query);
      return matchesSpec && matchesQuery;
    });
  }, [doctors, specialtyFilter, search]);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d._id === doctorId) || null,
    [doctors, doctorId]
  );

  const handleBooking = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!doctorId || !date || !time) {
      setError("Please select a doctor, date, and available time slot.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId,
          date,
          time,
          type: visitType,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Appointment booking failed.");
      }

      setSuccess(
        `Appointment confirmed with ${selectedDoctor?.name || "your doctor"} on ${date} at ${formatSlotTime(time)}.`
      );
      setTime("");
      setReason("");

      // Refresh slot availability immediately
      const slotRes = await fetch(
        `${API_URL}/api/doctors/${doctorId}/slots?date=${date}`
      );
      const slotData = await slotRes.json().catch(() => ({}));
      if (slotData.slots) setSlots(slotData.slots);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="booking-page">
      <header className="booking-header">
        <Link to="/" className="booking-brand">
          <span>M+</span>
          <div>
            <strong>MediCare</strong>
            <small>SMART HEALTHCARE</small>
          </div>
        </Link>

        <div className="booking-user">
          <span>Welcome, {patientName}</span>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/medi-ai">MediAI</Link>
        </div>
      </header>

      <main className="booking-container">
        <div className="booking-heading">
          <span>PERSONALIZED HEALTHCARE</span>
          <h1>Book an appointment</h1>
          <p>
            Choose a specialist, pick an available slot, and receive instant
            confirmation in your dashboard.
          </p>
        </div>

        <div className="booking-layout">
          <section className="doctor-selection">
            <div className="booking-section-heading">
              <span>01</span>
              <div>
                <h2>Available specialists</h2>
                <p>Filter by specialty or search by name and city.</p>
              </div>
            </div>

            <div className="booking-filter-controls">
              <div className="booking-search-input">
                <Search size={16} />
                <input
                  type="search"
                  placeholder="Search doctor, specialty, or city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="booking-specialty-pills">
                {specialties.map((spec) => (
                  <button
                    type="button"
                    key={spec}
                    className={specialtyFilter === spec ? "active" : ""}
                    onClick={() => setSpecialtyFilter(spec)}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="booking-message">Loading doctors...</p>
            ) : filteredDoctors.length === 0 ? (
              <p className="booking-message">
                No specialists match your search criteria.
              </p>
            ) : (
              <div className="booking-doctor-grid">
                {filteredDoctors.map((doctor) => (
                  <motion.button
                    type="button"
                    key={doctor._id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    className={`booking-doctor-card ${
                      doctorId === doctor._id ? "selected" : ""
                    }`}
                    onClick={() => {
                      setDoctorId(doctor._id);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    <img
                      src={doctor.image || "https://placehold.co/100"}
                      alt={doctor.name}
                    />

                    <div>
                      <h3>{doctor.name}</h3>
                      <p>{doctor.specialty}</p>
                      <small>{formatExperience(doctor.experience)} exp</small>
                      <small>
                        <MapPin size={10} style={{ display: "inline" }} />{" "}
                        {doctor.location} · ★ {doctor.rating} · ₹
                        {doctor.consultationFee || 600}
                      </small>
                    </div>

                    <span className="doctor-select-indicator">
                      {doctorId === doctor._id ? "✓" : "+"}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </section>

          <section className="booking-form-section">
            <div className="booking-section-heading">
              <span>02</span>
              <div>
                <h2>Appointment details</h2>
                <p>Live slot availability for your chosen date.</p>
              </div>
            </div>

            {selectedDoctor && (
              <div className="selected-doctor-summary">
                <strong>{selectedDoctor.name}</strong>
                <span>
                  {selectedDoctor.specialty} · ₹
                  {selectedDoctor.consultationFee || 600}
                </span>
              </div>
            )}

            <form onSubmit={handleBooking}>
              <label>Consultation mode</label>
              <div className="visit-type-toggle">
                <button
                  type="button"
                  className={visitType === "In-Person" ? "active" : ""}
                  onClick={() => setVisitType("In-Person")}
                >
                  <Building2 size={15} /> In-Person
                </button>
                <button
                  type="button"
                  className={visitType === "Video Consultation" ? "active" : ""}
                  onClick={() => setVisitType("Video Consultation")}
                >
                  <Video size={15} /> Video Visit
                </button>
              </div>

              <label htmlFor="appointment-date">
                <CalendarDays size={13} style={{ display: "inline", marginRight: 5 }} />
                Appointment date
              </label>
              <input
                id="appointment-date"
                type="date"
                min={getTodayMinDate()}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime("");
                }}
                required
              />

              <label>
                <Clock3 size={13} style={{ display: "inline", marginRight: 5 }} />
                Select time slot
              </label>
              {!doctorId ? (
                <p className="slot-hint">Select a specialist on the left to load slots.</p>
              ) : slotsLoading ? (
                <p className="slot-hint">Checking available slots...</p>
              ) : (
                <div className="slot-picker-grid">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.time}
                      disabled={!slot.available}
                      className={`slot-pill ${
                        time === slot.time ? "selected" : ""
                      } ${!slot.available ? "booked" : ""}`}
                      onClick={() => setTime(slot.time)}
                    >
                      {formatSlotTime(slot.time)}
                      {!slot.available && <small>Booked</small>}
                    </button>
                  ))}
                </div>
              )}

              <label htmlFor="appointment-reason">
                Reason for consultation
              </label>
              <textarea
                id="appointment-reason"
                placeholder="Briefly describe symptoms or questions for the doctor..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                rows={3}
              />

              {error && <div className="booking-error">{error}</div>}

              {success && (
                <div className="booking-success-card">
                  <CheckCircle2 size={18} />
                  <div>
                    <p>{success}</p>
                    <Link to="/dashboard">
                      Go to Patient Dashboard <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="booking-submit-btn"
                disabled={submitting || loading || !doctorId || !time}
              >
                {submitting ? "Booking..." : "Confirm Appointment →"}
              </button>

              <p className="booking-note">
                Free cancellation or rescheduling anytime from your dashboard.
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Appointment;
