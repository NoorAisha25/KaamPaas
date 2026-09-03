import Job from "../models/Job.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import { calculateTrustScore } from "../utils/trustScore.js";
import { findNearbyJobs } from "../utils/matching.js";

// POST /api/jobs - matches the Post a Job form exactly (skill, title, description, budget, city, urgency)
export const createJob = async (req, res) => {
  try {
    const { skill, title, description, budget, budgetType, city, urgency, location } = req.body;

    if (!skill || !title || !budget || !city) {
      return res.status(400).json({ message: "skill, title, budget, and city are required" });
    }

    const job = await Job.create({
      hirer: req.user.id,
      skill,
      title,
      description,
      budget,
      budgetType: budgetType || "day",
      city,
      urgency: urgency || "normal",
      location: location?.coordinates ? location : undefined,
    });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to create job", error: err.message });
  }
};

export const getMyJobs = async (req, res) => {
  const filter = req.user.role === "worker" ? { worker: req.user.id } : { hirer: req.user.id };
  const jobs = await Job.find(filter).sort({ createdAt: -1 });
  res.json(jobs);
};

export const getMatchingJobs = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Only workers have a matching-jobs feed" });
    }

    const worker = await User.findById(req.user.id);
    const { skill, lng, lat, radiusKm } = req.query;

    const jobs = await findNearbyJobs({
      lng: lng !== undefined ? parseFloat(lng) : undefined,
      lat: lat !== undefined ? parseFloat(lat) : undefined,
      skill,
      skills: worker.skills || [],
      city: worker.city,
      radiusKm: radiusKm ? parseFloat(radiusKm) : undefined,
    });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to load matching jobs", error: err.message });
  }
};

export const getJob = async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate("hirer", "name phone ratingAvg trustScore profilePhotoUrl")
    .populate("worker", "name phone ratingAvg trustScore profilePhotoUrl");
  if (!job) return res.status(404).json({ message: "Job not found" });

  let myReviewGiven = false;
  if (job.status === "completed") {
    const existing = await Review.findOne({ job: job._id, fromUser: req.user.id });
    myReviewGiven = !!existing;
  }

  res.json({ ...job.toObject(), myReviewGiven });
};

const ALLOWED_TRANSITIONS = {
  open: ["accepted", "cancelled"],
  accepted: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export const updateJobStatus = async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (!ALLOWED_TRANSITIONS[job.status].includes(newStatus)) {
      return res.status(400).json({ message: `Invalid transition: ${job.status} -> ${newStatus}` });
    }

    if (newStatus === "accepted") {
      if (req.user.role !== "worker") {
        return res.status(403).json({ message: "Only a worker can accept a job" });
      }
      job.worker = req.user.id;
    }

    job.status = newStatus;

    if (newStatus === "completed") {
      job.completedAt = new Date();

      await User.findByIdAndUpdate(job.worker, { $inc: { jobsDone: 1 } });
      await User.findByIdAndUpdate(job.hirer, { $inc: { jobsDone: 1 } });

      for (const userId of [job.worker, job.hirer]) {
        const user = await User.findById(userId);
        if (user) {
          user.trustScore = calculateTrustScore(user);
          await user.save();
        }
      }
    }

    if (newStatus === "cancelled" && job.worker) {
      await User.findByIdAndUpdate(job.worker, { $inc: { cancelledJobs: 1 } });
      const worker = await User.findById(job.worker);
      if (worker) {
        worker.trustScore = calculateTrustScore(worker);
        await worker.save();
      }
    }

    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to update job", error: err.message });
  }
};
