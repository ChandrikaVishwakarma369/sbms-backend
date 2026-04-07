import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Main token verification middleware
export const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ msg: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ msg: "Token validation failed" });
  }
};

// Admin only access check
export const adminOnly = (req, res, next) => {
  const role = req.user?.role?.toUpperCase();
  if (role === "ADMIN") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied: Admins only" });
  }
};

// Aliases for compatibility with different routes
export const auth = protect;
export const admin = adminOnly;