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

const router = express.Router();

// Apply request logger to all routes
router.use(requestLogger);

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

// ❌ DELETE customer by ID
router.delete("/:id", deleteCustomer);

export default router;
