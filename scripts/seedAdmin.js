import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config({ path: ".env" });

const seedAdmin = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@sbms.com";
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Admin user already exists!");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await User.create({
      name: "Super Admin",
      email: email,
      password: hashedPassword,
      role: "admin"
    });

    console.log("✅ Admin Created Successfully!");
    console.log("Email: admin@sbms.com");
    console.log("Password: admin123");
    
    process.exit();
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
