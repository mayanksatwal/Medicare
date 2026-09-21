import { Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import "./App.css";
import { useEffect } from "react";
const doctors = [
  {
    name: "Dr. Aarav Mehta",
    specialty: "Cardiologist",
    experience: "12 years",
    rating: "4.9",
    location: "New Delhi",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Dr. Ananya Sharma",
    specialty: "Dermatologist",
    experience: "9 years",
    rating: "4.8",
    location: "Noida",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Dr. Rohan Kapoor",
    specialty: "Neurologist",
    experience: "15 years",
    rating: "4.9",
    location: "Ghaziabad",
    image: "https://randomuser.me/api/portraits/men/46.jpg",
  },
  {
    name: "Dr. Meera Joshi",
    specialty: "Pediatrician",
    experience: "11 years",
    rating: "4.9",
    location: "Gurugram",
    image: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

const specialties = [
  ["✚", "General Physician", "Everyday healthcare"],
  ["♡", "Cardiology", "Heart & circulation"],
  ["✦", "Dermatology", "Skin & hair care"],
  ["◈", "Neurology", "Brain & nervous system"],
  ["⌂", "Pediatrics", "Child healthcare"],
  ["◇", "Orthopedics", "Bones & joints"],
];

const hospitals = [
  {
    name: "MediCare City Hospital",
    location: "New Delhi",
    distance: "2.4 km",
    rating: "4.8",
  },
  {
    name: "Green Valley Medical Centre",
    location: "Ghaziabad",
    distance: "5.8 km",
    rating: "4.7",
  },
  {
    name: "Prime Health Institute",
    location: "Noida",
    distance: "8.2 km",
    rating: "4.9",
  },
];

function Home() {
  const [location, setLocation] = useState(
    localStorage.getItem("medicareLocation") || "New Delhi"
  );

  const [locationOpen, setLocationOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [aiOpen, setAiOpen] = useState(false);

  const cities = [
    "New Delhi",
    "Ghaziabad",
    "Noida",
    "Gurugram",
    "Lucknow",
    "Dehradun",
  ];

  const selectLocation = (city) => {
    setLocation(city);
    localStorage.setItem("medicareLocation", city);
    setLocationOpen(false);
  };

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialty} ${doctor.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="home">

      {/* NAVBAR */}
      <nav className="navbar">

        <Link to="/" className="brand">
          <div className="brand-mark">+</div>

          <div className="brand-text">
            <strong>MediCare</strong>
            <span>SMART HEALTHCARE</span>
          </div>
        </Link>

        <div className="nav-center">
          <a href="#home">Home</a>
          <a href="#doctors">Doctors</a>
          <a href="#services">Services</a>
          <a href="#technology">Technology</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-right">

          <div className="location-wrapper">

            <button
              className="location-selector"
              onClick={() => setLocationOpen(!locationOpen)}
            >
              <span className="location-pin">⌖</span>
              <span>{location}</span>
              <span>{locationOpen ? "⌃" : "⌄"}</span>
            </button>

            {locationOpen && (
              <div className="location-menu">

                <div className="location-menu-header">
                  <div className="location-header-icon">⌖</div>

                  <div>
                    <strong>Choose location</strong>
                    <small>Find healthcare near you</small>
                  </div>
                </div>

                {cities.map((city) => (
                  <button
                    key={city}
                    className={`location-option ${
                      location === city ? "selected-city" : ""
                    }`}
                    onClick={() => selectLocation(city)}
                  >
                    <span>⌖</span>
                    {city}

                    {location === city && (
                      <b className="location-check">✓</b>
                    )}
                  </button>
                ))}

              </div>
            )}
          </div>

          <Link to="/login" className="nav-signin">
            Sign in
          </Link>

          <Link to="/login" className="nav-cta">
            Get Started <span>↗</span>
          </Link>

        </div>
      </nav>


      {/* HERO */}
      <section className="hero" id="home">

        <div className="hero-left">

          <div className="hero-eyebrow">
            <span></span>
            YOUR HEALTH, OUR PRIORITY
          </div>

          <h1>
            Trusted healthcare
            <br />
            for a healthier
            <br />
            <em>tomorrow</em>
          </h1>

          <p className="hero-description">
            Connect with expert doctors, book appointments,
            <br />
            and manage your health journey — all in one place.
          </p>

          <div className="hero-buttons">

            <Link to="/login" className="primary-button">
              <span>▣</span>
              Book an Appointment
              <b>→</b>
            </Link>

            <a href="#how-it-works" className="video-button">
              <span className="play-icon">▶</span>
              How it works
            </a>

          </div>

          <div className="trust-row">

            <div className="avatar-group">
              <div className="avatar avatar-one"></div>
              <div className="avatar avatar-two"></div>
              <div className="avatar avatar-three"></div>
              <div className="avatar avatar-four"></div>

              <div className="avatar-plus">+</div>
            </div>

            <div className="trust-divider"></div>

            <div className="trust-text">
              <strong>Trusted by <b>100K+</b> patients</strong>
              <span>in {location}</span>
            </div>

          </div>
        </div>


        {/* DOCTOR HERO */}
        <div className="hero-right">

          <div className="doctor-image">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1100&q=85"
              alt="Doctor"
            />
          </div>

          <div className="doctor-image-overlay"></div>


          <div className="health-card">
            <div className="health-card-icon">+</div>

            <div>
              <strong>24/7</strong>
              <span>Healthcare access</span>
            </div>
          </div>


          <div className="review-card">

            <div className="review-top">

              <div className="review-avatars">
                <span className="review-avatar review-avatar-1"></span>
                <span className="review-avatar review-avatar-2"></span>
                <span className="review-avatar review-avatar-3"></span>
              </div>

              <div className="review-rating">
                <strong>4.9</strong>
                <span className="stars">★★★★★</span>
              </div>

            </div>

            <p>"Care that actually feels personal."</p>

            <small>Trusted by 100K+ patients</small>

          </div>


          <div className="appointment-card">

            <div className="appointment-icon">◷</div>

            <div className="appointment-info">
              <span>Next available</span>
              <strong>Today · 4:30 PM</strong>
            </div>

            <span className="appointment-dot"></span>

          </div>


          <div className="secure-card">

            <div className="secure-icon">✓</div>

            <div>
              <strong>Private & Secure</strong>
              <span>Your data, our priority</span>
            </div>

          </div>

        </div>
      </section>


      {/* SEARCH */}
      <section className="search-section">

        <div className="search-heading">
          <span>FIND YOUR CARE</span>

          <h2>
            What kind of care
            <br />
            are you <em>looking for?</em>
          </h2>
        </div>

        <div className="search-box">

          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search doctor, specialty or hospital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button>
            Search
            <span>→</span>
          </button>

        </div>

      </section>


      {/* SPECIALTIES */}
      <section className="specialties-section">

        <div className="section-top-line">

          <div>
            <span>EXPLORE CARE</span>

            <h2>
              Popular <em>specialties</em>
            </h2>
          </div>

          <p>
            Find experienced healthcare professionals
            across the specialties you need.
          </p>

        </div>


        <div className="specialty-grid">

          {specialties.map(([icon, title, text]) => (
            <button
              className="specialty-card"
              key={title}
              onClick={() => setSearch(title)}
            >

              <div className="specialty-icon">
                {icon}
              </div>

              <strong>{title}</strong>

              <span>{text}</span>

              <b>↗</b>

            </button>
          ))}

        </div>

      </section>


      {/* DOCTORS */}
      <section className="doctors-section" id="doctors">

        <div className="section-top-line">

          <div>
            <span>OUR SPECIALISTS</span>

            <h2>
              Meet our <em>doctors</em>
            </h2>
          </div>

          <Link to="/login" className="outline-button">
            View all doctors →
          </Link>

        </div>


        <div className="doctor-grid">

          {filteredDoctors.map((doctor) => (

            <div className="doctor-card" key={doctor.name}>

              <div className="doctor-photo">

                <img
                  src={doctor.image}
                  alt={doctor.name}
                />

                <span className="available-badge">
                  ● Available
                </span>

              </div>

              <div className="doctor-info">

                <div className="doctor-rating">
                  ★ {doctor.rating}
                </div>

                <h3>{doctor.name}</h3>

                <p>{doctor.specialty}</p>

                <div className="doctor-meta">
                  <span>{doctor.experience}</span>
                  <span>•</span>
                  <span>{doctor.location}</span>
                </div>

                <Link
                  to="/login"
                  className="doctor-book"
                >
                  Book appointment
                  <span>↗</span>
                </Link>

              </div>

            </div>

          ))}

        </div>

        {filteredDoctors.length === 0 && (
          <div className="no-results">
            No doctors found for "{search}".
          </div>
        )}

      </section>


      {/* HOSPITALS */}
      <section className="hospital-section">

        <div className="section-top-line">

          <div>
            <span>NEARBY HEALTHCARE</span>

            <h2>
              Hospitals around <em>you</em>
            </h2>
          </div>

          <div className="current-location">
            ⌖ {location}
          </div>

        </div>


        <div className="hospital-grid">

          {hospitals.map((hospital, index) => (

            <div className="hospital-card" key={hospital.name}>

              <div className={`hospital-image hospital-${index + 1}`}>
                <span>
                  {index === 0 ? "24/7 EMERGENCY" : "SPECIALIZED CARE"}
                </span>
              </div>

              <div className="hospital-info">

                <div className="hospital-rating">
                  ★ {hospital.rating}
                </div>

                <h3>
                  {hospital.name}
                </h3>

                <p>
                  ⌖ {hospital.location}
                </p>

                <div className="hospital-bottom">

                  <span>
                    {hospital.distance} away
                  </span>

                  <button>
                    View →
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* HEALTH SERVICES */}
      <section className="health-services" id="services">

        <div className="section-heading centered">

          <span>MORE THAN APPOINTMENTS</span>

          <h2>
            Healthcare that goes
            <br />
            <em>beyond the visit.</em>
          </h2>

          <p>
            Everything you need to stay informed,
            organized and connected to your health.
          </p>

        </div>


        <div className="health-service-grid">

          <div className="health-service-card">
            <span>01</span>
            <div>◉</div>
            <h3>Online Consultation</h3>
            <p>Connect with doctors from wherever you are.</p>
            <a href="#doctors">Explore →</a>
          </div>

          <div className="health-service-card">
            <span>02</span>
            <div>⌁</div>
            <h3>Health Records</h3>
            <p>Keep your important healthcare information organized.</p>
            <a href="#about">Learn more →</a>
          </div>

          <div className="health-service-card">
            <span>03</span>
            <div>◷</div>
            <h3>Medicine Reminders</h3>
            <p>Stay on top of your everyday healthcare routine.</p>
            <a href="#about">Learn more →</a>
          </div>

          <div className="health-service-card">
            <span>04</span>
            <div>⌖</div>
            <h3>Lab Tests</h3>
            <p>Discover convenient diagnostic care options.</p>
            <a href="#about">Explore →</a>
          </div>

        </div>

      </section>


      {/* AI */}
    <section className="ai-section" id="technology">

        <div className="ai-visual">

          <div className="ai-orbit ai-orbit-one"></div>
          <div className="ai-orbit ai-orbit-two"></div>

          <div className="ai-core">
            <span>✦</span>
            <strong>AI</strong>
            <small>MEDICARE</small>
          </div>

        </div>


        <div className="ai-content">

          <span>SMART HEALTHCARE</span>

          <h2>
            Meet your
            <br />
            <em>MediCare AI.</em>
          </h2>

          <p>
            Get help navigating your healthcare journey
            with an intelligent assistant designed to
            make information easier to understand.
          </p>

          <button
            className="ai-button"
            onClick={() => setAiOpen(!aiOpen)}
          >
            {aiOpen ? "Close Assistant" : "Ask MediCare AI"}
            <span>✦</span>
          </button>


          {aiOpen && (

            <div className="ai-chat">

              <div className="ai-chat-header">
                <span>✦</span>
                MediCare AI
                <b>●</b>
              </div>

              <div className="ai-message">
                Hi! I can help you navigate MediCare.
                What would you like to explore?
              </div>

              <div className="ai-options">
                <button>Find a doctor</button>
                <button>Book appointment</button>
                <button>Find a hospital</button>
              </div>

            </div>

          )}

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">

        <div className="section-heading centered">

          <span>SIMPLE BY DESIGN</span>

          <h2>
            Healthcare in
            <br />
            <em>four steps.</em>
          </h2>

        </div>


        <div className="steps">

          <div className="step">
            <b>01</b>
            <div>⌕</div>
            <h3>Search</h3>
            <p>Find doctors, specialties or hospitals.</p>
          </div>

          <div className="step">
            <b>02</b>
            <div>◇</div>
            <h3>Choose</h3>
            <p>Compare professionals and available care.</p>
          </div>

          <div className="step">
            <b>03</b>
            <div>◷</div>
            <h3>Book</h3>
            <p>Choose a convenient appointment time.</p>
          </div>

          <div className="step">
            <b>04</b>
            <div>✚</div>
            <h3>Connect</h3>
            <p>Continue your healthcare journey.</p>
          </div>

        </div>

      </section>


      {/* REVIEWS */}
      <section className="reviews-section">

        <div className="section-top-line">

          <div>
            <span>PATIENT STORIES</span>

            <h2>
              Care people can
              <br />
              <em>feel.</em>
            </h2>
          </div>

          <div className="overall-rating">
            <strong>4.9</strong>
            <span>★★★★★</span>
            <small>from 25,000+ reviews</small>
          </div>

        </div>


        <div className="reviews-grid">

          <div className="big-review">

            <span className="quote-mark">“</span>

            <p>
              MediCare made finding a specialist
              incredibly simple. The whole experience
              felt organized from the first search
              to the appointment.
            </p>

            <div className="review-author">

              <img
                src="https://randomuser.me/api/portraits/women/65.jpg"
                alt="Patient"
              />

              <div>
                <strong>Priya S.</strong>
                <span>New Delhi</span>
              </div>

            </div>

          </div>


          <div className="small-review">

            <span>★★★★★</span>

            <p>
              "Very clean and easy to use."
            </p>

            <strong>Rahul M.</strong>

          </div>


          <div className="small-review dark-review">

            <span>★★★★★</span>

            <p>
              "Booking my appointment took less than a minute."
            </p>

            <strong>Neha K.</strong>

          </div>

        </div>

      </section>


      {/* WHY MEDICARE */}
      <section className="why-section">

        <div className="why-copy">

          <span>WHY MEDICARE</span>

          <h2>
            Healthcare should
            <br />
            feel <em>simple.</em>
          </h2>

          <p>
            From discovering the right doctor to managing
            your appointments, MediCare brings the important
            pieces of healthcare together.
          </p>

          <div className="why-points">

            <div>
              <b>01</b>
              <span>One connected healthcare experience</span>
            </div>

            <div>
              <b>02</b>
              <span>Modern technology with a human focus</span>
            </div>

            <div>
              <b>03</b>
              <span>Privacy-conscious design</span>
            </div>

          </div>

        </div>


        <div className="why-visual">

          <div className="why-ring"></div>

          <div className="why-center">
            <span>+</span>
            <strong>MediCare</strong>
            <small>CONNECTED CARE</small>
          </div>

          <div className="why-label label-a">SMART</div>
          <div className="why-label label-b">SIMPLE</div>
          <div className="why-label label-c">CONNECTED</div>

        </div>

      </section>


      {/* EMERGENCY */}
      <section className="emergency-section">

        <div>

          <span>NEED HELP NOW?</span>

          <h2>
            Healthcare when
            <br />
            every <em>second matters.</em>
          </h2>

        </div>

        <Link to="/login" className="emergency-button">
          🚑 Emergency Assistance
          <span>→</span>
        </Link>

      </section>


      {/* CTA */}
      <section className="final-cta">

        <span>START YOUR HEALTHCARE JOURNEY</span>

        <h2>
          Better care begins
          <br />
          with <em>one step.</em>
        </h2>

        <p>
          Discover a smarter way to connect with healthcare.
        </p>

        <Link to="/login" className="cta-button">
          Enter MediCare
          <span>↗</span>
        </Link>

      </section>


      {/* FOOTER */}
      <footer id="about">

        <div className="footer-main">

          <div className="footer-brand">

            <Link to="/" className="brand">

              <div className="brand-mark">+</div>

              <div className="brand-text">
                <strong>MediCare</strong>
                <span>SMART HEALTHCARE</span>
              </div>

            </Link>

            <p>
              Better technology.
              <br />
              Better healthcare.
              <br />
              Better future.
            </p>

          </div>


          <div className="footer-links">

            <div>
              <strong>Platform</strong>
              <a href="#doctors">Doctors</a>
              <a href="#services">Services</a>
              <a href="#technology">Technology</a>
            </div>

            <div>
              <strong>Healthcare</strong>
              <a href="#doctors">Specialists</a>
              <a href="#services">Health services</a>
              <a href="#about">Hospitals</a>
            </div>

            <div>
              <strong>Get Started</strong>
              <Link to="/login">Sign in</Link>
              <Link to="/login">Create account</Link>
              <Link to="/login">Book appointment</Link>
            </div>

          </div>

        </div>


        <div className="footer-bottom">
          <span>© 2026 MediCare</span>
          <span>Smart Healthcare Platform</span>
        </div>

      </footer>

    </div>
  );
}


function App() {
  useEffect(() => {
  fetch("http://localhost:5000/")
    .then((response) => response.json())
    .then((data) => {
      console.log(data.message);
    })
    .catch((error) => {
      console.error("Backend connection failed:", error);
    });
}, []);
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;