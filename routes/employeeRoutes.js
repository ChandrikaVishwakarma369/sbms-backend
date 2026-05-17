import express from "express";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import { auth } from "../middleware/authMiddleware.js"; // 🔐 Already fixed path!
import { allowRoles } from "../middleware/roleMiddleware.js";
import { validateEmployeeInput } from "../middleware/employeeMiddleware.js";

const router = express.Router();

/**
 * EMPLOYEE ROUTES
 * These routes handle team member management.
 */

// Routes
router.get("/", auth, getEmployees);
router.post("/", auth, allowRoles("ADMIN"), validateEmployeeInput, addEmployee);
router.put("/:id", auth, allowRoles("ADMIN"), updateEmployee);
router.delete("/:id", auth, allowRoles("ADMIN"), deleteEmployee);

export default router;
