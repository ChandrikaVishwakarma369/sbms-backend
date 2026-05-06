import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStats,
  getSalesData,
} from "../controllers/order.controller.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { validateOrderInput } from "../middleware/orderMiddleware.js";

const router = express.Router();

// 📊 GET order statistics
router.get("/stats", getOrderStats);

// 📈 GET sales data for chart
router.get("/sales", getSalesData);

// 📥 GET all orders
router.get("/", getAllOrders);

// 📖 GET single order by ID
router.get("/:id", getOrderById);

// ➕ CREATE new order (with validation)
router.post("/", validateOrderInput, createOrder);

// ✏️ UPDATE order by ID (with validation)
router.put("/:id", validateOrderInput, updateOrder);

// ❌ DELETE order by ID
router.delete("/:id", deleteOrder);

export default router;