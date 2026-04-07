import mongoose from "mongoose";
import dotenv from "dotenv";
import Employee from "../models/Employee.js";

dotenv.config({ path: ".env" });

const sampleEmployees = [
  { name: "Amit Verma", email: "amit.verma@example.com", role: "ADMIN", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=amit" },
  { name: "Priya Sharma", email: "priya.sharma@example.com", role: "MANAGER", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=priya" },
  { name: "Rahul Singh", email: "rahul.singh@example.com", role: "SALES", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=rahul" },
  { name: "Anjali Mehta", email: "anjali.mehta@example.com", role: "SUPPORT", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=anjali" },
  { name: "Vikram Patel", email: "vikram.patel@example.com", role: "DEVELOPER", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=vikram" },
  { name: "Neha Joshi", email: "neha.joshi@example.com", role: "SALES", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=neha" },
  { name: "Arjun Desai", email: "arjun.desai@example.com", role: "SUPPORT", status: "OFFLINE", avatar: "https://i.pravatar.cc/150?u=arjun" },
  { name: "Sonia Kapoor", email: "sonia.kapoor@example.com", role: "MANAGER", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=sonia" },
  { name: "Karan Malhotra", email: "karan.malhotra@example.com", role: "DEVELOPER", status: "ACTIVE", avatar: "https://i.pravatar.cc/150?u=karan" },
  { name: "Riya Sen", email: "riya.sen@example.com", role: "SALES", status: "OFFLINE", avatar: "https://i.pravatar.cc/150?u=riya" },
];

const seedDB = async () => {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");

        await Employee.deleteMany(); // Clear existing
        console.log("Cleared existing records");

        await Employee.insertMany(sampleEmployees);
        console.log("Successfully seeded 10 sample employees!");

        process.exit();
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedDB();
