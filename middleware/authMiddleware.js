import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {

    console.log("Cookies =>", req.cookies);

    let token = req.cookies.token;

    // Agar cookie me token nahi mila
    // to Authorization header check karo

    if (!token && req.headers.authorization) {

      token = req.headers.authorization.split(" ")[1];
    }

    // Token missing

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // User fetch

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // IMPORTANT

    req.user = user;
    req.userId = user._id;

    next();

  } catch (error) {

    console.log("AUTH ERROR:", error.message);

    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

// ADMIN CHECK

export const admin = (req, res, next) => {

  if (req.user.role?.toUpperCase() !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};