import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true, // Search optimization
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Faster lookups
    },
    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYEE"],
      uppercase: true,
      required: [true, "Role is required"],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "OFFLINE"],
      uppercase: true,
      default: "ACTIVE",
    },
    avatar: {
      type: String,
      default: "https://i.pravatar.cc/150", // Default generic avatar
    },
    salary: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);