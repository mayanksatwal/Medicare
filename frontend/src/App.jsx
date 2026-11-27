import { useEffect, useMemo, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  HeartPulse,
  Menu,
  ShieldCheck,
  Stethoscope,
  Brain,
  Bone,
  Baby,
  Sparkles,
  Search,
  Star,
  X,
  Send,
  Languages,
  Phone,
  MapPin,
  Mail,
  Heart,
  UserRound,
  Smile,
  ScanFace,
  Building2,
  LockKeyhole,
  CircleHelp,
  LogOut,
  LayoutDashboard,
  RotateCcw,
  MessageSquareHeart,
} from "lucide-react";

import Register from "./pages/Register.jsx";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import Appointment from "./pages/Appointment.jsx";
import MediAI from "./pages/MediAI.jsx";
import { PageTransition, ScrollToTop } from "./components/PageTransition.jsx";
import {
  API_URL,
  clearSession,
  formatExperience,
  formatSlotTime,
  getStoredUser,
  getTodayMinDate,
  getToken,
  matchesDepartment,
} from "./utils/api.js";

import "./App.css";

const departments = [
  {
    name: "Cardiology",
    desc: "Heart health, prevention and cardiovascular care.",
    icon: HeartPulse,
    tone: "rose",
  },
  {
    name: "Neurology",
    desc: "Specialist care for the brain and nervous system.",
    icon: Brain,
    tone: "violet",
  },
  {
    name: "Orthopedics",
    desc: "Bone, joint, muscle and mobility care.",
    icon: Bone,
    tone: "amber",
  },
  {
    name: "Dermatology",
    desc: "Care for skin, hair and nail conditions.",
    icon: ScanFace,
    tone: "cyan",
  },
  {
    name: "Pediatrics",
    desc: "Thoughtful healthcare for children and families.",
    icon: Baby,
    tone: "blue",
  },
  {
    name: "Gynecology",
    desc: "Women's health and wellness consultations.",
    icon: Heart,
    tone: "pink",
  },
  {
    name: "Dentistry",
    desc: "Preventive and restorative oral healthcare.",
    icon: Smile,
    tone: "teal",
  },
  {
    name: "General Medicine",
    desc: "Everyday health concerns and primary care.",
    icon: Stethoscope,
    tone: "indigo",
  },
];

const sampleTestimonials = [
  {
    quote:
      "Booking with Dr. Aarav Mehta took under a minute. The live slot picker and instant digital prescription in my dashboard made everything effortless.",
    name: "Aarohi S.",
    detail: "Cardiology Patient · New Delhi",
    initials: "AS",
  },
  {
    quote:
      "The department filters and MediAI assistant helped me pick the right specialist right away without calling multiple clinics.",
    name: "Kabir M.",
    detail: "Neurology Consultation · Noida",
    initials: "KM",
  },
  {
    quote:
      "Keeping all my vitals, lab records, and follow-up dates in one calm, clean dashboard saves so much time before every visit.",
    name: "Nisha R.",
    detail: "Primary Care · Gurugram",
    initials: "NR",
  },
];

function SectionTitle({ eyebrow, title, text, centered = false }) {
  return (
    <motion.div
      className={`section-title ${centered ? "centered" : ""}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
    >
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </motion.div>
  );
}

function Header({ onOpenAI }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));

  useEffect(() => {
    const syncAuth = () => {
      setUser(getToken() ? getStoredUser() : null);
    };
    const handleScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("medicare-auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("medicare-auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const dashboardRoute =
    user?.role === "doctor" ? "/doctor-dashboard" : "/dashboard";

  const handleSignOut = () => {
    clearSession();
    closeMenu();
    navigate("/");
  };

  const navItems = [
    ["Home", "#home"],
    ["Find Doctors", "#doctors"],
    ["Departments", "#departments"],
    ["Appointments", "#booking"],
    ["About Us", "#about"],
    ["Contact", "#contact"],
  ];

  return (
    <header
      className={`site-header premium-header ${scrolled ? "is-scrolled" : ""}`}
    >
      <div className="nav-shell">
        <Link to="/" className="brand premium-brand" onClick={closeMenu}>
          <span className="brand-mark">
            <Activity size={24} strokeWidth={2.5} />
          </span>

          <span className="brand-name">
            Medi<span>Care</span>
            <small>SMARTER HEALTH. BETTER CARE.</small>
          </span>
        </Link>

        <button
          className="mobile-menu premium-menu-button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav
          className={`nav-links premium-nav ${menuOpen ? "open" : ""}`}
          aria-label="Main navigation"
        >
          {navItems.map(([label, href]) => (
            <a key={label} href={href} onClick={closeMenu}>
              {label}
            </a>
          ))}

          <div className="mobile-nav-actions">
            {user ? (
              <>
                <Link to={dashboardRoute} onClick={closeMenu}>
                  <LayoutDashboard size={16} /> Dashboard ({user.name?.split(" ")[0]})
                </Link>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMenu}>
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="button button-primary"
                  onClick={closeMenu}
                >
                  Create Account <ArrowRight size={16} />
                </Link>
              </>
            )}

            <button
              type="button"
              className="button button-ai"
              onClick={() => {
                closeMenu();
                onOpenAI();
              }}
            >
              <Sparkles size={16} /> MediAI
            </button>
          </div>
        </nav>

        <div className="nav-actions premium-actions">
          {user ? (
            <>
              <Link to={dashboardRoute} className="button premium-signup">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button
                type="button"
                className="nav-login nav-signout-btn"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Sign In
              </Link>

              <Link to="/register" className="button premium-signup">
                Get Started <ArrowUpRight size={16} />
              </Link>
            </>
          )}

          <button
            type="button"
            className="button button-ai premium-ai"
            onClick={onOpenAI}
          >
            <Sparkles size={16} /> MediAI
          </button>
        </div>
      </div>
    </header>
  );
}

function ChatAssistant({ open, onClose }) {
  const initialGreeting = {
    role: "assistant",
    text: "Hello! I'm MediAI, your virtual healthcare assistant. I can share general health information, help you explore departments, and guide you around MediCare. How can I help today?",
  };

  const [messages, setMessages] = useState([initialGreeting]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [language, setLanguage] = useState("en");

  const prompts = [
    "Find a doctor",
    "Explore departments",
    "How do I book an appointment?",
    "I have a mild headache and fever",
  ];

  const send = async (value = input) => {
    const message = value.trim();
    if (!message || busy) return;

    setMessages((items) => [...items, { role: "user", text: message }]);
    setInput("");
    setBusy(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message:
            language === "hi"
              ? `Please reply in Hindi: ${message}`
              : message,
          language,
        }),
      });

      const data = await response.json().catch(() => ({}));
      const replyText = data.reply || data.response;

      if (!response.ok || !replyText) {
        throw new Error(data.message || "MediAI service is currently unavailable.");
      }

      setMessages((items) => [
        ...items,
        { role: "assistant", text: replyText },
      ]);
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          text: `I couldn't reach the AI service (${error.message}). Please try again or use the doctor directory above.`,
          warning: true,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="MediAI assistant"
          >
            <div className="chat-head">
              <div className="chat-avatar">
                <Sparkles size={20} />
              </div>

              <div>
                <strong>MediAI</strong>
                <span>
                  <i /> Virtual healthcare assistant
                </span>
              </div>

              <div className="chat-head-actions">
                <button
                  type="button"
                  aria-label="Reset chat"
                  title="Clear conversation"
                  onClick={() => setMessages([initialGreeting])}
                >
                  <RotateCcw size={15} />
                </button>

                <button
                  type="button"
                  aria-label="Change language"
                  onClick={() => setLanguage(language === "en" ? "hi" : "en")}
                >
                  <Languages size={17} />
                  {language === "en" ? "EN" : "HI"}
                </button>

                <button
                  type="button"
                  aria-label="Close assistant"
                  onClick={onClose}
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            <div className="chat-safety">
              <ShieldCheck size={15} />
              General health information only · Not for emergencies
            </div>

            <div className="chat-messages">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`chat-message ${message.role} ${
                    message.warning ? "warning" : ""
                  }`}
                >
                  <span style={{ whiteSpace: "pre-line" }}>{message.text}</span>
                </motion.div>
              ))}

              {busy && (
                <div className="chat-message assistant typing">
                  <i />
                  <i />
                  <i />
                </div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="chat-prompts">
                <span>TRY ASKING</span>

                {prompts.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => send(prompt)}
                  >
                    {prompt} <ArrowUpRight size={13} />
                  </button>
                ))}
              </div>
            )}

            <form
              className="chat-compose"
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={2000}
                placeholder={
                  language === "hi"
                    ? "अपना सवाल लिखें..."
                    : "Describe what you need help with..."
                }
                aria-label="Message MediAI"
              />

              <button
                type="submit"
                disabled={!input.trim() || busy}
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </form>

            <p className="chat-disclaimer">
              MediAI cannot diagnose, prescribe, or replace a qualified medical
              professional. If this may be an emergency, call 112 immediately.
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Hero({ onOpenAI }) {
  const navigate = useNavigate();

  return (
    <section className="hero-section" id="home">
      <div className="hero-grid">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-badge">
            <Sparkles size={15} />
            AI-POWERED HEALTHCARE PLATFORM
          </div>

          <h1>
            Your Health, Our Priority.
            <span> Powered by AI.</span>
          </h1>

          <p>
            Experience smarter healthcare with AI-powered assistance, verified
            specialists, live time-slot appointments, and connected digital care.
          </p>

          <div className="hero-buttons">
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="button button-primary"
              onClick={() => navigate("/appointment")}
            >
              Book an Appointment <ArrowRight size={17} />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="button button-light"
              onClick={onOpenAI}
            >
              <Sparkles size={17} /> Talk to MediAI
            </motion.button>
          </div>

          <div className="trust-row">
            <div className="trust-item">
              <ShieldCheck size={19} />
              <span>Verified doctors</span>
            </div>

            <div className="trust-item">
              <CalendarDays size={19} />
              <span>Live slot booking</span>
            </div>

            <div className="trust-item">
              <UserRound size={19} />
              <span>Digital prescriptions</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-image-wrap"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1100&q=85"
            alt="Doctor in a professional healthcare setting"
          />

          <div className="hero-image-shade" />

          <button
            type="button"
            className="hero-floating appointment-float"
            onClick={() => navigate("/appointment")}
          >
            <div className="float-icon blue">
              <CalendarDays size={20} />
            </div>

            <div>
              <strong>Appointments</strong>
              <small>Book & manage visits online</small>
            </div>

            <Check size={18} className="float-check" />
          </button>

          <button
            type="button"
            className="hero-floating ai-float"
            onClick={onOpenAI}
          >
            <div className="float-icon cyan">
              <Sparkles size={20} />
            </div>

            <div>
              <strong>Meet MediAI</strong>
              <small>Your virtual health guide</small>
            </div>

            <ArrowUpRight size={17} />
          </button>
        </motion.div>
      </div>

      <div className="hero-bottom">
        <span>CARE THAT CONNECTS</span>
        <div />
        <span>TECHNOLOGY THAT EMPOWERS</span>
        <div />
        <span>PEOPLE AT THE HEART</span>
      </div>
    </section>
  );
}

function Departments({ activeDepartment, onSelectDepartment }) {
  return (
    <section className="section departments-section" id="departments">
      <SectionTitle
        eyebrow="OUR SPECIALITIES"
        title="Care for every stage of life."
        text="Select a department below to instantly filter available specialists."
      />

      <div className="department-grid">
        {departments.map((department, index) => {
          const Icon = department.icon;
          const isSelected = activeDepartment === department.name;

          return (
            <motion.article
              className={`department-card ${isSelected ? "department-active" : ""}`}
              key={department.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -4 }}
              onClick={() => onSelectDepartment(department.name)}
              style={{ cursor: "pointer" }}
            >
              <div className={`department-icon ${department.tone}`}>
                <Icon size={25} />
              </div>

              <h3>{department.name}</h3>
              <p>{department.desc}</p>

              <button
                type="button"
                className="card-link card-link-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDepartment(department.name);
                }}
              >
                Find a specialist <ArrowUpRight size={16} />
              </button>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function Doctors({
  doctors,
  loading,
  error,
  selectedDepartment,
  onClearDepartment,
  onBook,
}) {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");

  useEffect(() => {
    if (selectedDepartment) {
      setSpecialty(selectedDepartment);
    }
  }, [selectedDepartment]);

  const specialties = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization || doctor.specialty)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [doctors]);

  const filteredDoctors = doctors.filter((doctor) => {
    const name = doctor.name || doctor.fullName || "";
    const spec = doctor.specialization || doctor.specialty || "";
    const loc = doctor.location || "";

    const queryMatch = `${name} ${spec} ${loc}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const specMatch =
      specialty === "All" ||
      spec === specialty ||
      matchesDepartment(spec, specialty);

    return queryMatch && specMatch;
  });

  const resetFilters = () => {
    setSearch("");
    setSpecialty("All");
    onClearDepartment?.();
  };

  return (
    <section className="section doctors-section" id="doctors">
      <SectionTitle
        eyebrow="MEET OUR PROFESSIONALS"
        title="Find the right doctor."
        text="Browse verified MediCare specialists and book an available slot."
      />

      <div className="doctor-filters">
        <label className="doctor-search">
          <Search size={18} />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search doctor, specialty, or city..."
          />
        </label>

        <label className="specialty-filter">
          <span className="sr-only">Filter by specialty</span>

          <select
            value={specialties.includes(specialty) ? specialty : "All"}
            onChange={(event) => {
              setSpecialty(event.target.value);
              if (event.target.value === "All") onClearDepartment?.();
            }}
          >
            {specialties.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <ChevronDown size={16} />
        </label>

        {(search || specialty !== "All") && (
          <button
            type="button"
            className="button button-outline"
            onClick={resetFilters}
          >
            Show All ({doctors.length})
          </button>
        )}
      </div>

      {specialty !== "All" && (
        <div className="active-filter-bar">
          <span>
            Showing specialists for <strong>{specialty}</strong>
          </span>
          <button type="button" onClick={resetFilters}>
            Clear filter ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <span className="loader" /> Loading doctors...
        </div>
      ) : error ? (
        <div className="empty-state">
          <CircleHelp size={30} />
          <h3>Doctors could not be loaded</h3>
          <p>{error}</p>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="empty-state">
          <Search size={30} />
          <h3>No matching doctors</h3>
          <p>Try another name, city, or reset the specialty filter.</p>
          <button
            type="button"
            className="button button-primary"
            style={{ marginTop: 14 }}
            onClick={resetFilters}
          >
            View All Doctors
          </button>
        </div>
      ) : (
        <div className="doctor-grid">
          {filteredDoctors.map((doctor, index) => {
            const name = doctor.name || doctor.fullName || "Doctor";
            const spec =
              doctor.specialization ||
              doctor.specialty ||
              "Medical professional";

            return (
              <motion.article
                className="doctor-card"
                key={doctor._id || doctor.id || index}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <div className="doctor-photo">
                  {doctor.image || doctor.photo ? (
                    <img
                      src={doctor.image || doctor.photo}
                      alt={name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="doctor-placeholder">
                      <UserRound size={42} />
                    </div>
                  )}
                </div>

                <div className="doctor-card-content">
                  <div className="doctor-card-top-meta">
                    <span className="doctor-specialty">{spec}</span>
                    {doctor.rating > 0 && (
                      <span className="doctor-rating-pill">
                        <Star size={12} fill="currentColor" /> {doctor.rating}
                      </span>
                    )}
                  </div>

                  <h3>{name}</h3>

                  <p>
                    {doctor.qualification ||
                      doctor.qualifications ||
                      "MBBS, MD · Verified Specialist"}
                  </p>

                  <div className="doctor-meta">
                    <span>
                      <Clock3 size={14} />
                      {formatExperience(doctor.experience)}
                    </span>
                    {doctor.location && (
                      <span>
                        <MapPin size={14} />
                        {doctor.location}
                      </span>
                    )}
                    {doctor.consultationFee !== undefined && (
                      <span>₹{doctor.consultationFee}</span>
                    )}
                  </div>

                  <div className="doctor-availability is-verified">
                    <span className="availability-dot verified" />
                    Available for Appointments
                  </div>

                  <button
                    type="button"
                    className="button button-primary doctor-book"
                    onClick={() => onBook(doctor)}
                  >
                    Book Appointment <ArrowRight size={15} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Booking({ doctors, onBooked }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    department: "",
    doctorId: "",
    date: getTodayMinDate(),
    time: "",
    type: "In-Person",
    reason: "",
  });

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const availableDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      if (!form.department) return true;
      const spec = doctor.specialization || doctor.specialty || "";
      return matchesDepartment(spec, form.department);
    });
  }, [doctors, form.department]);

  useEffect(() => {
    if (!form.doctorId || !form.date) {
      setSlots([]);
      return;
    }

    let active = true;
    setSlotsLoading(true);
    fetch(`${API_URL}/api/doctors/${form.doctorId}/slots?date=${form.date}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        setSlots(data.slots || []);
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
  }, [form.doctorId, form.date]);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setError("");
    setSuccess("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.doctorId || !form.date || !form.time) {
      setError("Please select a doctor, date and time slot.");
      return;
    }

    const token = getToken();
    const user = getStoredUser();

    if (!token) {
      sessionStorage.setItem("pendingBooking", JSON.stringify(form));
      navigate("/login", {
        state: {
          from: `/appointment?doctorId=${form.doctorId}`,
          message: "Sign in to confirm your appointment slot.",
        },
      });
      return;
    }

    if (user?.role === "doctor") {
      setError("Doctor accounts cannot book patient appointments.");
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: form.doctorId,
          date: form.date,
          time: form.time,
          type: form.type,
          reason: form.reason.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Appointment booking failed.");
      }

      setSuccess(
        data.message || "Your appointment request was submitted successfully!"
      );

      setForm((prev) => ({
        ...prev,
        time: "",
        reason: "",
      }));

      onBooked?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section booking-section" id="booking">
      <div className="booking-layout">
        <div className="booking-copy">
          <span className="eyebrow">SIMPLE. CONVENIENT. CONNECTED.</span>

          <h2>Your next step towards better care.</h2>

          <p>
            Choose a department, pick a specialist, and select a live available
            time slot. Instant confirmation saved directly to your dashboard.
          </p>

          <div className="booking-benefit">
            <ShieldCheck size={20} />
            <span>
              Real-time slot checking prevents double-bookings automatically.
            </span>
          </div>

          <div className="booking-benefit">
            <CalendarDays size={20} />
            <span>
              Choose In-Person clinic visits or Video Consultations.
            </span>
          </div>
        </div>

        <form className="booking-form" onSubmit={submit}>
          <div className="form-title">
            <div>
              <span className="eyebrow">BOOK YOUR VISIT</span>
              <h3>Appointment request</h3>
            </div>

            <CalendarDays size={27} />
          </div>

          <label>
            Department (optional filter)
            <select
              value={form.department}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  department: event.target.value,
                  doctorId: "",
                  time: "",
                }));
                setError("");
                setSuccess("");
              }}
            >
              <option value="">All Departments</option>

              {departments.map((item) => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Doctor
            <select
              required
              value={form.doctorId}
              onChange={(event) => {
                setForm((current) => ({
                  ...current,
                  doctorId: event.target.value,
                  time: "",
                }));
                setError("");
                setSuccess("");
              }}
            >
              <option value="">Select doctor</option>

              {availableDoctors.map((doctor, index) => (
                <option
                  key={doctor._id || doctor.id || index}
                  value={doctor._id || doctor.id}
                >
                  {doctor.name || doctor.fullName} — {doctor.specialty}
                </option>
              ))}
            </select>
          </label>

          <div className="form-row">
            <label>
              Appointment date
              <input
                type="date"
                required
                min={getTodayMinDate()}
                value={form.date}
                onChange={(event) => update("date", event.target.value)}
              />
            </label>

            <label>
              Visit type
              <select
                value={form.type}
                onChange={(event) => update("type", event.target.value)}
              >
                <option value="In-Person">In-Person</option>
                <option value="Video Consultation">Video Consultation</option>
              </select>
            </label>
          </div>

          <label>
            Available time slot
            <select
              required
              value={form.time}
              disabled={!form.doctorId || slotsLoading}
              onChange={(event) => update("time", event.target.value)}
            >
              <option value="">
                {!form.doctorId
                  ? "Select a doctor first"
                  : slotsLoading
                  ? "Checking slots..."
                  : "Select an available slot"}
              </option>
              {slots.map((slot) => (
                <option
                  key={slot.time}
                  value={slot.time}
                  disabled={!slot.available}
                >
                  {formatSlotTime(slot.time)}{" "}
                  {slot.available ? "" : "(Booked)"}
                </option>
              ))}
            </select>
          </label>

          <label>
            Reason for visit (optional)
            <input
              type="text"
              maxLength={500}
              placeholder="e.g. Follow-up, routine checkup, mild fever..."
              value={form.reason}
              onChange={(event) => update("reason", event.target.value)}
            />
          </label>

          {error && <p className="form-error">{error}</p>}
          {success && (
            <div className="form-success">
              {success}{" "}
              <Link
                to="/dashboard"
                style={{ textDecoration: "underline", fontWeight: 700 }}
              >
                View in Dashboard →
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="button button-primary submit-booking"
            disabled={busy}
          >
            {busy
              ? "Submitting..."
              : getToken()
              ? "Confirm Appointment"
              : "Continue to Sign In & Book"}
            {!busy && <ArrowRight size={17} />}
          </button>
        </form>
      </div>
    </section>
  );
}

function WhyChoose() {
  const benefits = [
    {
      icon: Sparkles,
      title: "AI-powered assistance",
      text: "Explore general health information and navigate the platform with MediAI.",
    },
    {
      icon: Stethoscope,
      title: "Verified specialists",
      text: "Browse doctor profiles, qualifications, fees, and live slot availability.",
    },
    {
      icon: CalendarDays,
      title: "Instant appointments",
      text: "Book, reschedule, or cancel appointments directly from your account.",
    },
    {
      icon: LockKeyhole,
      title: "Secure health records",
      text: "Track vitals, lab summaries, and doctor-issued digital prescriptions.",
    },
    {
      icon: Building2,
      title: "Department directory",
      text: "Explore hospital specialties and filter specialists in one click.",
    },
    {
      icon: HeartPulse,
      title: "Patient & doctor portals",
      text: "Dedicated dashboards tailored for both patients and verified clinicians.",
    },
  ];

  return (
    <section className="section why-section" id="about">
      <SectionTitle
        eyebrow="WHY MEDICARE"
        title="Thoughtful technology. Better connected care."
        text="A seamless digital experience designed around patients and clinicians."
        centered
      />

      <div className="benefit-grid">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;

          return (
            <motion.article
              className="benefit-card"
              key={benefit.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <div className="benefit-icon">
                <Icon size={23} />
              </div>

              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

function Statistics({ doctorCount }) {
  const stats = [
    {
      value: doctorCount,
      label: "Active Specialists",
      icon: UserRound,
    },
    {
      value: departments.length,
      label: "Clinical Departments",
      icon: Building2,
    },
  ];

  return (
    <section className="statistics-section">
      <div className="statistics-heading">
        <span className="eyebrow">MEDICARE AT A GLANCE</span>
        <h2>Healthcare information, in one place.</h2>
        <p>Live directory metrics backed directly by the MediCare database.</p>
      </div>

      <div className="statistics-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.label}>
              <Icon size={24} />
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Testimonials() {
  const [active, setActive] = useState(0);
  const item = sampleTestimonials[active];

  const next = () =>
    setActive((current) => (current + 1) % sampleTestimonials.length);

  const previous = () =>
    setActive(
      (current) =>
        (current - 1 + sampleTestimonials.length) % sampleTestimonials.length
    );

  return (
    <section className="section testimonial-section">
      <SectionTitle
        eyebrow="PATIENT EXPERIENCES"
        title="A more personal digital experience."
        text="Illustrative stories showing how MediCare connects patients with care."
        centered
      />

      <div className="testimonial-card">
        <div className="testimonial-stars" aria-label="Sample rating">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={17} fill="currentColor" />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.25 }}
          >
            <blockquote>“{item.quote}”</blockquote>

            <div className="testimonial-person">
              <div>{item.initials}</div>

              <span>
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="testimonial-controls">
          <button
            type="button"
            onClick={previous}
            aria-label="Previous testimonial"
          >
            ←
          </button>

          <span>
            {active + 1} / {sampleTestimonials.length}
          </span>

          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}

function Emergency() {
  return (
    <section className="emergency-section">
      <div className="emergency-icon">
        <HeartPulse size={31} />
      </div>

      <div className="emergency-copy">
        <span>URGENT MEDICAL SUPPORT</span>
        <h2>Need immediate medical assistance?</h2>

        <p>
          Do not wait for a chatbot response in an emergency. Contact local
          emergency services or go to the nearest emergency department.
        </p>
      </div>

      <a className="button emergency-button" href="tel:112">
        <Phone size={17} /> Emergency: 112
      </a>
    </section>
  );
}

function ContactModal({ open, onClose }) {
  const storedUser = getStoredUser();
  const [form, setForm] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    subject: "General Inquiry",
    message: "",
  });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus({ type: "", text: "" });

    try {
      const response = await fetch(`${API_URL}/api/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not send message.");
      }
      setStatus({ type: "success", text: data.message });
      setForm((prev) => ({ ...prev, message: "" }));
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">24/7 CARE DESK</span>
                <h3>Contact MediCare Support</h3>
              </div>
              <button type="button" onClick={onClose} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <label>
                Your Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </label>

              <label>
                Topic
                <select
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Appointment Help">Appointment Help</option>
                  <option value="Doctor Onboarding">Doctor Onboarding</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
              </label>

              <label>
                Message
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="How can our team assist you?"
                />
              </label>

              {status.text && (
                <p
                  className={
                    status.type === "error" ? "form-error" : "form-success"
                  }
                >
                  {status.text}
                </p>
              )}

              <button
                type="submit"
                className="button button-primary"
                style={{ width: "100%", marginTop: 12 }}
                disabled={busy}
              >
                {busy ? "Sending..." : "Send Message"} <Send size={15} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LegalModal({ type, onClose }) {
  return (
    <AnimatePresence>
      {type && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="eyebrow">MEDICARE POLICIES</span>
                <h3>
                  {type === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
                </h3>
              </div>
              <button type="button" onClick={onClose} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>

            <div className="legal-body">
              {type === "privacy" ? (
                <>
                  <p>
                    MediCare collects only the account details, appointment
                    bookings, and optional health records you explicitly provide
                    to deliver healthcare coordination.
                  </p>
                  <p>
                    Passwords are encrypted using bcrypt, sessions are secured
                    with signed JWT tokens, and your health records are visible
                    only to you and the clinicians you book consultations with.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    MediCare facilitates specialist discovery, online
                    appointment scheduling, and general health education via
                    MediAI.
                  </p>
                  <p>
                    MediAI does not provide medical diagnoses or emergency care.
                    Always consult a qualified physician for medical decisions,
                    and dial 112 in an emergency.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Footer({ onSelectDepartment, onOpenContact, onOpenLegal }) {
  return (
    <footer className="site-footer" id="contact">
      <div className="footer-grid">
        <div className="footer-about">
          <Link to="/" className="brand footer-brand">
            <span className="brand-mark">
              <Activity size={22} />
            </span>

            <span>
              Medi<span>Care</span>
              <small>SMARTER HEALTH. BETTER CARE.</small>
            </span>
          </Link>

          <p>
            A digital healthcare platform connecting patients with verified
            doctor discovery, live appointment booking, digital prescriptions,
            and AI-assisted health information.
          </p>

          <button
            type="button"
            className="button button-primary"
            style={{ marginTop: 18 }}
            onClick={onOpenContact}
          >
            <MessageSquareHeart size={16} /> Send Support Message
          </button>
        </div>

        <div>
          <h3>Explore</h3>
          <a href="#home">Home</a>
          <a href="#doctors">Find Doctors</a>
          <a href="#departments">Departments</a>
          <a href="#booking">Appointments</a>
        </div>

        <div>
          <h3>Departments</h3>

          {departments.slice(0, 5).map((item) => (
            <button
              type="button"
              key={item.name}
              className="footer-link-btn"
              onClick={() => onSelectDepartment(item.name)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div>
          <h3>Contact</h3>
          <p>
            <Phone size={15} /> +91 1800-120-4848 (24/7 Helpline)
          </p>
          <p>
            <Mail size={15} /> care@medicare.health
          </p>
          <p>
            <MapPin size={15} /> MediCare Health Plaza, New Delhi
          </p>

          <div className="social-links">
            <button
              type="button"
              onClick={onOpenContact}
              aria-label="Contact MediCare"
            >
              ✉
            </button>
            <a href="#home" aria-label="Back to top">
              ↑
            </a>
            <Link to="/medi-ai" aria-label="Open MediAI">
              ✦
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} MediCare. All rights reserved.
        </span>
        <span className="footer-legal-links">
          <button type="button" onClick={() => onOpenLegal("privacy")}>
            Privacy Policy
          </button>
          {" · "}
          <button type="button" onClick={() => onOpenLegal("terms")}>
            Terms & Conditions
          </button>
        </span>
        <span>AI assistance is not medical diagnosis or emergency care.</span>
      </div>
    </footer>
  );
}

function Home() {
  const [doctors, setDoctors] = useState([]);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [legalType, setLegalType] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const navigate = useNavigate();

  const loadDoctors = async () => {
    setDoctorLoading(true);
    setDoctorError("");

    try {
      const response = await fetch(`${API_URL}/api/doctors`);
      if (!response.ok) {
        throw new Error("Could not load the doctor directory.");
      }

      const data = await response.json();
      setDoctors(
        Array.isArray(data) ? data : data.doctors || data.data || []
      );
    } catch (error) {
      setDoctorError(error.message);
    } finally {
      setDoctorLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleSelectDepartment = (deptName) => {
    setSelectedDepartment(deptName);
    document.getElementById("doctors")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const bookDoctor = (doctor) => {
    const doctorId = doctor._id || doctor.id;
    const token = getToken();

    if (!token) {
      navigate("/login", {
        state: {
          from: `/appointment?doctorId=${doctorId}`,
          message: `Sign in to book an appointment with ${doctor.name}.`,
        },
      });
      return;
    }

    navigate(`/appointment?doctorId=${doctorId}`, {
      state: { doctorId },
    });
  };

  return (
    <>
      <Header onOpenAI={() => setChatOpen(true)} />

      <main>
        <Hero onOpenAI={() => setChatOpen(true)} />

        <Departments
          activeDepartment={selectedDepartment}
          onSelectDepartment={handleSelectDepartment}
        />

        <Doctors
          doctors={doctors}
          loading={doctorLoading}
          error={doctorError}
          selectedDepartment={selectedDepartment}
          onClearDepartment={() => setSelectedDepartment("All")}
          onBook={bookDoctor}
        />

        <Booking doctors={doctors} onBooked={loadDoctors} />

        <WhyChoose />
        <Statistics doctorCount={doctors.length} />
        <Testimonials />
        <Emergency />
      </main>

      <Footer
        onSelectDepartment={handleSelectDepartment}
        onOpenContact={() => setContactOpen(true)}
        onOpenLegal={(type) => setLegalType(type)}
      />

      <motion.button
        type="button"
        className="chat-launcher"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setChatOpen(true)}
        aria-label="Open MediAI assistant"
      >
        <Sparkles size={20} />
        <span>Ask MediAI</span>
      </motion.button>

      <ChatAssistant open={chatOpen} onClose={() => setChatOpen(false)} />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      <LegalModal type={legalType} onClose={() => setLegalType(null)} />
    </>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const rolesKey = allowedRoles ? allowedRoles.join(",") : "";

  useEffect(() => {
    let active = true;

    async function verifyUser() {
      const token = getToken();

      if (!token) {
        if (active) {
          setLoading(false);
          navigate("/login", {
            replace: true,
            state: { from: location.pathname + location.search },
          });
        }
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Session expired.");
        }

        const currentUser = data.user || data;
        if (!currentUser.role) {
          throw new Error("Account role is missing.");
        }

        if (!active) return;

        localStorage.setItem("user", JSON.stringify(currentUser));
        localStorage.setItem("userRole", currentUser.role);
        localStorage.setItem("patientName", currentUser.name || "");
        localStorage.setItem("patientEmail", currentUser.email || "");
        setUser(currentUser);

        if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
          navigate(
            currentUser.role === "doctor" ? "/doctor-dashboard" : "/dashboard",
            { replace: true }
          );
        }
      } catch {
        clearSession();
        if (active) {
          navigate("/login", {
            replace: true,
            state: { from: location.pathname + location.search },
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    verifyUser();

    return () => {
      active = false;
    };
  }, [rolesKey, navigate, location.pathname, location.search]);

  if (loading) {
    return (
      <div className="route-verifying">
        <span className="loader" />
        <p>Verifying your MediCare session...</p>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return children;
}

function App() {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />

          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />

          <Route
            path="/register"
            element={
              <PageTransition>
                <Register />
              </PageTransition>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointment"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PageTransition>
                  <Appointment />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/medi-ai"
            element={
              <ProtectedRoute allowedRoles={["patient", "doctor"]}>
                <PageTransition>
                  <MediAI />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <PageTransition>
                  <DoctorDashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </MotionConfig>
  );
}

export default App;
