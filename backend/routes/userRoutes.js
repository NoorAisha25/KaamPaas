import express from "express";
import { protect } from "../middleware/auth.js";
import { getMyProfile, updateMyProfile, searchWorkers } from "../controllers/userController.js";

const router = express.Router();
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.get("/workers", searchWorkers); // public - matches Find Workers page being browsable

export default router;
