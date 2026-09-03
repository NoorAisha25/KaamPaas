import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    hirer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    skill: { type: String, required: true }, 
    title: { type: String, required: true },
    description: { type: String }, 

    budget: { type: Number, required: true }, 
    budgetType: {
      type: String,
      enum: ["hour", "day", "month"],
      default: "day",
    },
    city: { type: String, required: true }, 

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
