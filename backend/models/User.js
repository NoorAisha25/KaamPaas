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
      enum: ["en", "hi", "mr", "ta", "bn"], 
      default: "en",
    },


    skills: [{ type: String }], 
    dailyRate: { type: Number }, 
    rateType: {
      type: String,
      enum: ["day", "hour", "month"],
      default: "day",
    },
    city: { type: String, index: true }, 
    available: { type: Boolean, default: true },

   
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },

    ratingAvg: { type: Number, default: 0 }, 
    ratingCount: { type: Number, default: 0 }, 
    jobsDone: { type: Number, default: 0 }, 
    cancelledJobs: { type: Number, default: 0 }, 
    isVerified: { type: Boolean, default: false }, 
    trustScore: { type: Number, default: 0 }, 

    profilePhotoUrl: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });
userSchema.index({ skills: 1, available: 1, city: 1 });

export default mongoose.model("User", userSchema);
