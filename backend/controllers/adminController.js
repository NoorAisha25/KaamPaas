import User from "../models/User.js";
import Job from "../models/Job.js";

export const getStats = async (req, res) => {
  try {
    const [totalWorkers, totalHirers, verifiedWorkers, availableWorkers] = await Promise.all([
      User.countDocuments({ role: "worker" }),
      User.countDocuments({ role: "hirer" }),
      User.countDocuments({ role: "worker", isVerified: true }),
      User.countDocuments({ role: "worker", available: true }),
    ]);

    const [totalJobs, openJobs, acceptedJobs, inProgressJobs, completedJobs, cancelledJobs] = await Promise.all([
      Job.countDocuments({}),
      Job.countDocuments({ status: "open" }),
      Job.countDocuments({ status: "accepted" }),
      Job.countDocuments({ status: "in_progress" }),
      Job.countDocuments({ status: "completed" }),
      Job.countDocuments({ status: "cancelled" }),
    ]);

    const recentUsers = await User.find({ role: { $in: ["worker", "hirer"] } })
      .select("name role city createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      users: { totalWorkers, totalHirers, verifiedWorkers, availableWorkers },
      jobs: { totalJobs, openJobs, acceptedJobs, inProgressJobs, completedJobs, cancelledJobs },
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load admin stats", error: err.message });
  }
};
