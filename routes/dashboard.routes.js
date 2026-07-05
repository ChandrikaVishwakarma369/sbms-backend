import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth, getDashboardStats);

export default router;
