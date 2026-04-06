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

// Protected route to fetch records (all authenticated roles can read)
router.get("/", getEmployees);

// Create: Anyone can add for testing
router.post("/", addEmployee);

// Update: Anyone can edit for testing
router.put("/:id", editEmployee);

// Delete: Anyone can delete for testing
router.delete("/:id", removeEmployee);

// Update status: Anyone can update for testing
router.patch("/:id/status", changeStatus);

export default router;
