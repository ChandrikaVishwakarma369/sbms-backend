import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

/**
 * 📦 IMAGE UPLOAD LOGIC
 * Handles binary file storage in the local /uploads folder.
 */

// Configure Storage Engine
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB Limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Only Images allowed!");
    }
  },
});

// Single File Upload Endpoint
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  // Construct Public URL
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.status(200).json({ success: true, url: imageUrl });
});

export default router;
