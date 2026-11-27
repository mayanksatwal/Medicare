const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    category: {
      type: String,
      enum: ["Lab Report", "Vitals", "Imaging", "Vaccination", "Checkup", "Other"],
      default: "Checkup",
    },
    date: { type: String, required: true },
    provider: { type: String, default: "MediCare Clinic", trim: true, maxlength: 100 },
    summary: { type: String, default: "", trim: true, maxlength: 600 },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
      required: true,
    },

    doctorVerificationStatus: {
      type: String,
      enum: ["not_required", "pending", "approved", "rejected"],
      default: "not_required",
    },

    password: {
      type: String,
      default: null,
    },

    googleId: {
      type: String,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    avatar: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    age: {
      type: Number,
      min: 0,
      max: 130,
      default: null,
    },

    gender: {
      type: String,
      enum: ["", "Male", "Female", "Other", "Prefer not to say"],
      default: "",
    },

    bloodGroup: {
      type: String,
      enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: "",
    },

    allergies: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    emergencyContact: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    healthMetrics: {
      bloodPressure: { type: String, default: "" },
      heartRate: { type: String, default: "" },
      bloodSugar: { type: String, default: "" },
      weight: { type: String, default: "" },
      height: { type: String, default: "" },
      updatedAt: { type: Date, default: null },
    },

    healthRecords: {
      type: [healthRecordSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
