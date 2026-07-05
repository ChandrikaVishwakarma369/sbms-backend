import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from "../controllers/customer.controller.js";
import { requestLogger, validateCustomerInput } from "../middleware/customerMiddleware.js";
import { auth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Apply request logger to all routes
router.use(requestLogger);

// Protect all routes
router.use(auth);

// 📊 GET customer statistics
router.get("/stats", getCustomerStats);

// 📥 GET all customers
router.get("/", getCustomers);

// 📖 GET single customer by ID
router.get("/:id", getCustomerById);

// ➕ CREATE new customer
router.post("/", validateCustomerInput, createCustomer);

// ✏️ UPDATE customer by ID
router.put("/:id", validateCustomerInput, updateCustomer);

// ❌ DELETE customer by ID — Admin only
router.delete("/:id", allowRoles("ADMIN"), deleteCustomer);

export default router;
