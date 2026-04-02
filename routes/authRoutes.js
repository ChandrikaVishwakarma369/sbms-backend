import express from "express";
import { loginUser, createEmployee, logoutUser } from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);

// ONLY ADMIN CAN CREATE EMPLOYEE
router.post("/create-employee", protect, adminOnly, createEmployee);

export default router;