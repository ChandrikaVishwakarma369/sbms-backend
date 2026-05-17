// // import express from "express";
// // import { loginUser, createEmployee, logoutUser } from "../controllers/authController.js";
// // import { protect, auth } from "../middleware/authMiddleware.js";

// // const router = express.Router();

// // router.post("/login", loginUser);
// // router.post("/logout", logoutUser);

// // // ONLY ADMIN CAN CREATE EMPLOYEE
// // router.post("/create-employee", protect, auth, createEmployee);

// // export default router;
// const express = require("express");

// const router = express.Router();

// const bcrypt = require("bcryptjs");

// const User = require("../models/User");

// const authMiddleware = require(
//   "../middleware/authMiddleware"
// );



// // ================= GET PROFILE =================

// router.get(
//   "/profile",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const user = await User.findById(
//         req.user.id
//       ).select("-password");

//       if (!user) {
//         return res.status(404).json({
//           message: "User Not Found",
//         });
//       }

//       res.status(200).json(user);
//     } catch (error) {
//       console.log(error);

//       res.status(500).json({
//         message: "Server Error",
//       });
//     }
//   }
// );



// // ================= UPDATE PROFILE =================

// router.put(
//   "/update-profile",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const {
//         name,
//         email,
//         mobile,
//         profileImage,
//       } = req.body;

//       const user = await User.findById(
//         req.user.id
//       );

//       if (!user) {
//         return res.status(404).json({
//           message: "User Not Found",
//         });
//       }

//       user.name = name;
//       user.email = email;
//       user.mobile = mobile;
//       user.profileImage =
//         profileImage;

//       await user.save();

//       res.status(200).json({
//         message:
//           "Profile Updated Successfully",
//       });
//     } catch (error) {
//       console.log(error);

//       res.status(500).json({
//         message: "Server Error",
//       });
//     }
//   }
// );



// // ================= CHANGE PASSWORD =================

// router.put(
//   "/change-password",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const {
//         currentPassword,
//         newPassword,
//       } = req.body;

//       const user = await User.findById(
//         req.user.id
//       );

//       if (!user) {
//         return res.status(404).json({
//           message: "User Not Found",
//         });
//       }

//       // CHECK CURRENT PASSWORD

//       const isMatch =
//         await bcrypt.compare(
//           currentPassword,
//           user.password
//         );

//       if (!isMatch) {
//         return res.status(400).json({
//           message:
//             "Current Password Incorrect",
//         });
//       }

//       // HASH NEW PASSWORD

//       const salt =
//         await bcrypt.genSalt(10);

//       const hashedPassword =
//         await bcrypt.hash(
//           newPassword,
//           salt
//         );

//       user.password = hashedPassword;

//       await user.save();

//       res.status(200).json({
//         message:
//           "Password Changed Successfully",
//       });
//     } catch (error) {
//       console.log(error);

//       res.status(500).json({
//         message: "Server Error",
//       });
//     }
//   }
// );

// module.exports = router;
import express from "express";
import { loginUser, createEmployee, logoutUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/login", loginUser);

router.post("/logout", logoutUser);

// ONLY ADMIN CAN CREATE EMPLOYEE ACCOUNT
router.post("/create-employee", protect, allowRoles("ADMIN"), createEmployee);

export default router;