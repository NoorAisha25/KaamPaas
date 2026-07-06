import express from "express";
import { protect, requireRole } from "../middleware/auth.js";
import { createJob, getMyJobs, getMatchingJobs, getJob, updateJobStatus } from "../controllers/jobController.js";

const router = express.Router();
router.post("/", protect, requireRole("hirer"), createJob);
router.get("/mine", protect, getMyJobs);
router.get("/matching", protect, requireRole("worker"), getMatchingJobs); // must be before /:id
router.get("/:id", protect, getJob);
router.patch("/:id/status", protect, updateJobStatus);

export default router;
