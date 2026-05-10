import express from "express";

import {
  getProfile,
  updateProfile,
  changePassword,
} from "../controllers/settingsController.js";

import { protect } from "../middleware/authMiddleware.js";

import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/profile", protect, getProfile);

router.put(
  "/profile",
  protect,
  upload.single("image"),
  updateProfile
);

router.put(
  "/password",
  protect,
  changePassword
);

export default router;