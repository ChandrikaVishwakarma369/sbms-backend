import express from "express";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
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
router.put("/:id", protect, allowRoles("ADMIN"), updateEmployee);
router.delete("/:id", protect, allowRoles("ADMIN"), deleteEmployee);

export default router;