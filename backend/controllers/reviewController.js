import Review from "../models/Review.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import { calculateTrustScore } from "../utils/trustScore.js";

export const createReview = async (req, res) => {
  try {
    const { jobId, rating, comment } = req.body;

    if (!jobId || !rating) {
      return res.status(400).json({ message: "jobId and rating are required" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.status !== "completed") {
      return res.status(400).json({ message: "You can only review a job after it is marked completed" });
    }

    const fromUserId = req.user.id;
    const isHirer = job.hirer.toString() === fromUserId;
    const isWorker = job.worker && job.worker.toString() === fromUserId;

    if (!isHirer && !isWorker) {
      return res.status(403).json({ message: "You were not part of this job" });
    }

    const toUserId = isHirer ? job.worker : job.hirer;
    if (!toUserId) {
      return res.status(400).json({ message: "This job has no assigned worker to review" });
    }

    const review = await Review.create({
      job: jobId,
      fromUser: fromUserId,
      toUser: toUserId,
      rating,
      comment,
    });

    const allReviews = await Review.find({ toUser: toUserId });
    const newRatingAvg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    const targetUser = await User.findById(toUserId);
    targetUser.ratingAvg = newRatingAvg;
    targetUser.ratingCount = allReviews.length;
    targetUser.trustScore = calculateTrustScore(targetUser);
    await targetUser.save();

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You already reviewed this job" });
    }
    res.status(500).json({ message: "Failed to submit review", error: err.message });
  }
};

export const getReviewsForUser = async (req, res) => {
  const reviews = await Review.find({ toUser: req.params.userId })
    .populate("fromUser", "name role")
    .sort({ createdAt: -1 });
  res.json(reviews);
};
