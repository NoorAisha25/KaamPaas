import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who is giving the rating
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who is being rated

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// A person can only review a given job once (one review per direction:
// hirer -> worker, worker -> hirer). This is what actually stops someone
// from spamming ratings for the same job.
reviewSchema.index({ job: 1, fromUser: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
