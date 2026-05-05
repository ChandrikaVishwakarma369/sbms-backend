import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * PROTECT MIDDLEWARE
 * Verifies JWT token from cookies or Authorization header.
 * Sets req.user for subsequent middleware/controllers.
 */
export const protect = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user and exclude password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ success: false, message: "Token validation failed" });
  }
};

/**
 * ADMIN ONLY MIDDLEWARE
 * Restricts access to users with ADMIN role.
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role?.toUpperCase() === "ADMIN") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied: Admins only" });
  }
};

// Aliases for convenience
export const auth = protect;
export const admin = adminOnly;
