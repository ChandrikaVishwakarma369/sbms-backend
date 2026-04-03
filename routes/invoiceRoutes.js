import express from "express";

//  existing auth middleware — JWT verify + req.user sets 
import { protect } from "../middleware/authMiddleware.js";

// Invoice specific middlewares
import {
  validateInvoiceBody,
  adminOnly,
  canEditInvoice,
} from "../middleware/invoiceMiddleware.js";

// Controllers
import {
  getAllInvoices,
  getInvoiceStats,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoiceController.js";

const router = express.Router();

// protect → JWT check for all routes
router.use(protect);

// Stats — /stats/:id 
router.get("/stats", getInvoiceStats);

// GET all (role filter handle in controller)
router.get("/", getAllInvoices);

// GET single (ownership check in controller)
router.get("/:id", getInvoiceById);

// CREATE — Admin + Employee 
router.post("/", validateInvoiceBody, createInvoice);

// UPDATE — canEditInvoice: admin free, employee → PENDING only
router.put("/:id", canEditInvoice, validateInvoiceBody, updateInvoice);

// DELETE — adminOnly
router.delete("/:id", adminOnly, deleteInvoice);

export default router;