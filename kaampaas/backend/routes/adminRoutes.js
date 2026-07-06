import express from "express";
import { protect, requireRole } from "../middleware/auth.js";
import { getStats } from "../controllers/adminController.js";

const router = express.Router();
router.get("/stats", protect, requireRole("admin"), getStats);

export default router;
