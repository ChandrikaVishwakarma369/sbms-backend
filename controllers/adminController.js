import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createEmployee = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = new User({
      name,
      email,
      password: hashedPassword,
      role: "employee"
    });

    await employee.save();

    res.json({ message: "Employee created", employee });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};