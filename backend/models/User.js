import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["worker", "hirer", "admin"],
      required: true,
    },

    preferredLanguage: {
      type: String,
      enum: ["en", "hi", "mr", "ta", "bn"], // matches the अ/म/ঠ/ਬ language switcher in navbar
      default: "en",
    },

    // ---- Worker-specific fields ----
    skills: [{ type: String }], // e.g. ["plumber"] - see utils/skills.js for the fixed list
    dailyRate: { type: Number }, // the rate number - unit is in rateType below
    rateType: {
      type: String,
      enum: ["day", "hour", "month"],
      default: "day",
    },
    city: { type: String, index: true }, // kept as a human-readable label + fallback when GPS isn't available
    available: { type: Boolean, default: true },

    // GeoJSON point - real GPS coordinates, same pattern Uber/Swiggy/Rapido
    // use for "nearby" matching. This is what makes search genuinely
    // hyperlocal instead of matching an entire city or state.
    // Format: { type: "Point", coordinates: [longitude, latitude] }
    // NOTE: MongoDB wants [lng, lat] order - do not flip it.
    //
    // IMPORTANT: no default on `type` here - if it defaulted to "Point"
    // automatically, any user created without a location (e.g. the admin
    // account, or anyone who denies location permission) would end up
    // with a broken half-formed point ({ type: "Point" }, no
    // coordinates), which a 2dsphere index cannot index and crashes on.
    // Leaving both sub-fields undefined means the whole `location` key
    // is simply absent for that user, which 2dsphere handles fine.
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },

    // ---- Trust / reputation fields (drive the badges shown on worker cards) ----
    ratingAvg: { type: Number, default: 0 }, // "4.6" - recalculated from Review documents, see reviewController.js
    ratingCount: { type: Number, default: 0 }, // "(23)"
    jobsDone: { type: Number, default: 0 }, // completed jobs (worker: jobs worked; hirer: jobs hired for)
    cancelledJobs: { type: Number, default: 0 }, // feeds the completion-rate part of trustScore
    isVerified: { type: Boolean, default: false }, // green shield badge next to name
    trustScore: { type: Number, default: 0 }, // 0-100, computed in utils/trustScore.js - this is what actually ranks search results

    profilePhotoUrl: { type: String },
  },
  { timestamps: true }
);

// 2dsphere index is REQUIRED for $near geospatial queries to work
userSchema.index({ location: "2dsphere" });
userSchema.index({ skills: 1, available: 1, city: 1 });

export default mongoose.model("User", userSchema);