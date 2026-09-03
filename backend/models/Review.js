import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

reviewSchema.index({ job: 1, fromUser: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
