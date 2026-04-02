import express from "express";
import { createEmployee } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/create-employee", protect, isAdmin, createEmployee);

export default router;