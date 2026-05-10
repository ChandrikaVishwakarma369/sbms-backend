// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: {
//     type: String,
//     unique: true,
//   },
//   password: String,
//   role: {
//     type: String,
//     enum: ["ADMIN", "EMPLOYEE"],
//     default: "EMPLOYEE",
//     uppercase: true,
//   },
// }, { timestamps: true });

// export default mongoose.model("User", userSchema);
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
    },

    password: String,

    phone: String,

    bio: String,

    profileImage: String,

    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYEE"],
      default: "EMPLOYEE",
      uppercase: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);