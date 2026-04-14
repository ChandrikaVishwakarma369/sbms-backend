import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};


// 🔹 LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // true in production
    sameSite: "lax",
    path: "/",
  });

  res.json({
    message: "Login successful",
    user: {
      id: user._id,
      role: user.role,
      name: user.name,
    },
  });
};



// 🔹 CREATE EMPLOYEE (ONLY ADMIN)
export const createEmployee = async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const employee = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "employee",
  });

  res.json(employee);
};



// 🔹 LOGOUT
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};