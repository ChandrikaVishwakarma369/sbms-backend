// // import mongoose from "mongoose";

// // const userSchema = new mongoose.Schema({
// //   name: String,
// //   email: {
// //     type: String,
// //     unique: true,
// //   },
// //   password: String,
// //   role: {
// //     type: String,
// //     enum: ["ADMIN", "EMPLOYEE"],
// //     default: "EMPLOYEE",
// //     uppercase: true,
// //   },
// // }, { timestamps: true });

// // export default mongoose.model("User", userSchema);
// // import mongoose from "mongoose";

// // const userSchema = new mongoose.Schema(
// //   {
// //     name: String,

// //     email: {
// //       type: String,
// //       unique: true,
// //     },

// //     password: String,

// //     phone: String,

// //     bio: String,

// //     profileImage: String,

// //     role: {
// //       type: String,
// //       enum: ["ADMIN", "EMPLOYEE"],
// //       default: "EMPLOYEE",
// //       uppercase: true,
// //     },
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model("User", userSchema);
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//     },

//     email: {
//       type: String,
//       unique: true,
//     },

//     mobile: {
//       type: String,
//     },

//     role: {
//       type: String,
//       default: "User",
//     },

//     password: {
//       type: String,
//     },

//     profileImage: {
//       type: String,
//       default: "",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model(
//   "User",
//   userSchema
// );
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYEE"],
      default: "EMPLOYEE",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

export default User;