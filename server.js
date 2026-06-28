import { fileURLToPath } from 'url';
import path from 'path';
import fs from "fs";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import invoiceRoutes from './routes/invoiceRoutes.js';
import employeeRoutes from "./routes/employeeRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/order.routes.js";
import customerRoutes from "./routes/customer.route.js";
import settingsRouter from "./routes/settingsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";


import {
  requestLogger,
  errorHandler
} from "./middleware/orderMiddleware.js";

dotenv.config();
connectDB();

const app = express();


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://sbms-gold.vercel.app",
    "https://www.sbms-gold.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Static folder for images
app.use("/uploads", express.static(uploadDir));

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/invoices", invoiceRoutes); 
app.use("/api/orders", orderRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/settings", settingsRouter);
app.use("/api/user", userRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running ✅" });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});


app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});