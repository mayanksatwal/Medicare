export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:5001");

export function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("patientToken") ||
    ""
  );
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore invalid JSON
  }
  const email = localStorage.getItem("patientEmail");
  const name = localStorage.getItem("patientName");
  const role = localStorage.getItem("userRole") || "patient";
  if (!email) return null;
  return { name: name || "Patient", email, role };
}

export function saveSession(data, fallbackEmail = "") {
  const token = data.token || data.accessToken;
  const user = data.user || data.patient || {};

  if (!token) {
    throw new Error("Authentication token was not received from the server.");
  }

  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("userRole", user.role || "patient");
  localStorage.setItem("patientEmail", user.email || fallbackEmail || "");
  if (user.name) {
    localStorage.setItem("patientName", user.name);
  }
  if (data.doctorProfile) {
    localStorage.setItem("doctorProfile", JSON.stringify(data.doctorProfile));
  }
  window.dispatchEvent(new Event("medicare-auth-change"));
  return user;
}

export function clearSession() {
  [
    "token",
    "authToken",
    "patientToken",
    "patientName",
    "patientEmail",
    "user",
    "userRole",
    "doctorProfile",
  ].forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event("medicare-auth-change"));
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const err = new Error(data.message || data.error || "Request failed.");
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

const DEPARTMENT_ALIASES = {
  cardiology: ["cardiology", "cardiologist", "heart"],
  neurology: ["neurology", "neurologist", "brain"],
  orthopedics: ["orthopedics", "orthopedist", "orthopedic", "bone"],
  dermatology: ["dermatology", "dermatologist", "skin"],
  pediatrics: ["pediatrics", "pediatrician", "child"],
  gynecology: ["gynecology", "gynecologist", "women"],
  dentistry: ["dentistry", "dentist", "dental"],
  "general medicine": ["general medicine", "general physician", "internal medicine", "primary care"],
};

export function matchesDepartment(doctorSpecialty = "", departmentName = "") {
  if (!departmentName || departmentName === "All") return true;
  const spec = doctorSpecialty.trim().toLowerCase();
  const dept = departmentName.trim().toLowerCase();
  if (spec === dept || spec.includes(dept) || dept.includes(spec)) return true;

  const aliases = DEPARTMENT_ALIASES[dept] || [];
  return aliases.some((alias) => spec.includes(alias));
}

export function formatExperience(exp) {
  if (!exp) return "Experience verified";
  const text = String(exp).trim();
  if (/year|yr/i.test(text)) return text;
  return `${text} years`;
}

export function formatSlotTime(slot) {
  if (!slot || !/^\d{2}:\d{2}$/.test(slot)) return slot || "";
  return new Date(`2000-01-01T${slot}:00`).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTodayMinDate() {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}
