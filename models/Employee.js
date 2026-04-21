import mongoose from "mongoose";

/**
 * EMPLOYEE MODEL
 * Defines the structure for team members with role-based access control.
 */
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
      enum: ["ADMIN", "MANAGER", "SALES", "SUPPORT", "DEVELOPER"],
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
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Search optimization
employeeSchema.index({ name: "text", email: "text" });

export default mongoose.model("Employee", employeeSchema);
