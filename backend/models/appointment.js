const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    dosage: { type: String, required: true, trim: true, maxlength: 80 },
    duration: { type: String, default: "5 days", trim: true, maxlength: 60 },
    instructions: { type: String, default: "After meals", trim: true, maxlength: 200 },
  },
  { _id: false }
);

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["In-Person", "Video Consultation"],
      default: "In-Person",
    },

    reason: {
      type: String,
      default: "",
      maxlength: 500,
    },

    notes: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    prescription: {
      medications: {
        type: [medicationSchema],
        default: [],
      },
      advice: {
        type: String,
        default: "",
        maxlength: 1000,
      },
      issuedAt: {
        type: Date,
        default: null,
      },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double-booking active slots while allowing cancelled/rejected slots to be re-booked.
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "approved"] } },
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
