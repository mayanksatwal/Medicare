const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    specialty: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      default: "MBBS, MD",
      trim: true,
    },

    experience: {
      type: String,
      default: "5 years",
    },

    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },

    consultationFee: {
      type: Number,
      default: 600,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    bio: {
      type: String,
      default:
        "Dedicated specialist committed to compassionate, evidence-based patient care.",
      trim: true,
      maxlength: 600,
    },

    languages: {
      type: [String],
      default: ["English", "Hindi"],
    },

    availableSlots: {
      type: [String],
      default: [
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
      ],
    },

    image: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);
