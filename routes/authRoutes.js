import express from "express";
import { loginUser, createEmployee, logoutUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);

// ONLY ADMIN CAN CREATE EMPLOYEE ACCOUNT
router.post("/create-employee", protect, allowRoles("ADMIN"), createEmployee);

export default router;