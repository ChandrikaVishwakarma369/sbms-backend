import express from "express";
import {
  getEmployees,
  addEmployee,
  editEmployee,
  removeEmployee,
  changeStatus,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js"; // 🔐 Already fixed path!
import { allowRoles } from "../middleware/roleMiddleware.js";
import { validateEmployeeInput } from "../middleware/employeeMiddleware.js";

const router = express.Router();

/**
 * EMPLOYEE ROUTES
 * These routes handle team member management.
 */

// Routes
router.get("/", protect, getEmployees);
router.post("/", protect, allowRoles("ADMIN"), validateEmployeeInput, addEmployee);
router.put("/:id", protect, allowRoles("ADMIN"), editEmployee);
router.patch("/:id/status", protect, allowRoles("ADMIN"), changeStatus);
router.delete("/:id", protect, allowRoles("ADMIN"), removeEmployee);

export default router;
