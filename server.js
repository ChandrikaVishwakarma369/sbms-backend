import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import invoiceRoutes from './routes/invoiceRoutes.js'
import orderRoutes from "./routes/order.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";


import {
  requestLogger,
  errorHandler
} from "./middleware/orderMiddleware.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger); // already correct 👍

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes); 

app.use("/api/orders", orderRoutes);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running ✅" });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Error Handler (must be last)
app.use(errorHandler);

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});