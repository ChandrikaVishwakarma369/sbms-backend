import express from "express";
import {
  getEmployees,
  addEmployee,
  editEmployee,
  removeEmployee,
  changeStatus,
} from "../controllers/employeeController.js";
import { protect } from "../middleware/authMiddleware.js"; // 🔐 Already fixed path!
import { canEdit, canDelete } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * EMPLOYEE ROUTES
 * These routes handle team member management.
 */

// Routes (Authentication removed for simplified development)
router.get("/", getEmployees);
router.post("/", addEmployee);
router.put("/:id", editEmployee);
router.patch("/:id/status", changeStatus);
router.delete("/:id", removeEmployee);

export default router;
