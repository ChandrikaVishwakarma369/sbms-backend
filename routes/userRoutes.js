import express from "express";
import bcrypt from "bcryptjs";

import User from "../models/User.js";

import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();


// ================= GET PROFILE =================

router.get(
  "/profile",
  auth,
  async (req, res) => {
    try {

      const user = await User.findById(
        req.userId
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json(user);

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);


// ================= UPDATE PROFILE =================

router.put(
  "/update-profile",
  auth,
  async (req, res) => {
    try {

      const {
        name,
        email,
        mobile,
        profileImage,
      } = req.body;

      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.name = name;
      user.email = email;
      user.mobile = mobile;
      user.profileImage = profileImage;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);


// ================= CHANGE PASSWORD =================

router.put(
  "/change-password",
  auth,
  async (req, res) => {
    try {

      const {
        currentPassword,
        newPassword,
      } = req.body;

      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // CHECK OLD PASSWORD

      const isMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password incorrect",
        });
      }

      // HASH NEW PASSWORD

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

      user.password = hashedPassword;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  }
);

export default router;