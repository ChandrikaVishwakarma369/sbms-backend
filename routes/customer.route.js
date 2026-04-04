import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
} from "../controllers/customer.controller.js";

const router = express.Router();

// 📊 GET customer statistics
router.get("/stats", getCustomerStats);

// 📥 GET all customers
router.get("/", getCustomers);

// 📖 GET single customer by ID
router.get("/:id", getCustomerById);

// ➕ CREATE new customer
router.post("/", createCustomer);

// ✏️ UPDATE customer by ID
router.put("/:id", updateCustomer);

// ❌ DELETE customer by ID
router.delete("/:id", deleteCustomer);

export default router;
