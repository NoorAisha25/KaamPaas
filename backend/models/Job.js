import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    hirer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    skill: { type: String, required: true }, // selected from the skill grid
    title: { type: String, required: true }, // "Fix leaking tap"
    description: { type: String }, // "Describe the work"

    budget: { type: Number, required: true }, // ₹
    budgetType: {
      type: String,
      enum: ["hour", "day", "month"],
      default: "day",
    },
    city: { type: String, required: true }, // human-readable label + fallback when GPS isn't available

    // Same GeoJSON pattern as User.location - lets a worker's matching feed
    // find "jobs within a couple of km", not "jobs somewhere in this city".
    // No default on `type` - see the matching comment in models/User.js
    // for why that's important (broken half-formed points crash the
    // 2dsphere index).
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },

    urgency: {
      type: String,
      enum: ["normal", "today", "urgent"],
      default: "normal",
    },

    // Matches the state machine: TODAY/OPEN badges seen on "My Jobs" cards
    status: {
      type: String,
      enum: ["open", "accepted", "in_progress", "completed", "cancelled"],
      default: "open",
    },

    completedAt: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ location: "2dsphere" });
jobSchema.index({ skill: 1, city: 1, status: 1 });

export default mongoose.model("Job", jobSchema);