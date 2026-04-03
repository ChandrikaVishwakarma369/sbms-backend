import Invoice from "../models/Invoice.js";

// ─── HELPER: build filter based on role ──────────────────────────────────────
const buildFilter = (user, extra = {}) => {
  const filter = { ...extra };
  // Employee sirf apne invoices dekh sakta hai
  if (user.role !== "admin") {
    filter.createdBy = user._id;
  }
  return filter;
};


// ─── GET ALL INVOICES ─────────────────────────────────────────────────────────
export const getAllInvoices = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const filter = buildFilter(req.user);

    // Status filter
    if (status && status !== "All Status") {
      filter.status = status.toUpperCase();
    }

    if (search.trim()) {
      filter.$or = [
        { invoiceId:    { $regex: search.trim(), $options: "i" } },
        { customerName: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Invoice.countDocuments(filter);

    const invoices = await Invoice.find(filter)
      .populate("createdBy", "name email role") // useful for admin view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── GET STATS (Paid/Pending/Overdue) ────────────────────────────────────────
export const getInvoiceStats = async (req, res) => {
  try {
    const baseFilter = buildFilter(req.user); // role-aware

    // Total Paid — current month only
    const now          = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [paidResult, pendingResult, overdueResult] = await Promise.all([
      Invoice.aggregate([
        { $match: { ...baseFilter, status: "PAID", date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Invoice.aggregate([
        { $match: { ...baseFilter, status: "PENDING" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Invoice.aggregate([
        { $match: { ...baseFilter, status: "OVERDUE" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPaid:    paidResult[0]?.total    || 0,
        totalPending: pendingResult[0]?.total || 0,
        totalOverdue: overdueResult[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── GET SINGLE INVOICE ───────────────────────────────────────────────────────
// GET /api/invoices/:id
export const getInvoiceById = async (req, res) => {
  try {
    const filter = buildFilter(req.user, { _id: req.params.id });
    const invoice = await Invoice.findOne(filter).populate("createdBy", "name email role");

    if (!invoice)
      return res.status(404).json({
        success: false,
        message: "Invoice not found or access denied.",
      });

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── CREATE INVOICE ───────────────────────────────────────────────────────────
// POST /api/invoices
export const createInvoice = async (req, res) => {
  try {
    const { customerName, date, subtotal, gstPercent = 18, status = "PENDING" } = req.body;

    const invoice = await Invoice.create({
      customerName,
      date,
      subtotal:   Number(subtotal),
      gstPercent: Number(gstPercent),
      status:     status.toUpperCase(),
      createdBy:  req.user._id, // ← logged-in user ka id
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── UPDATE INVOICE ───────────────────────────────────────────────────────────
// PUT /api/invoices/:id
// Guard: canEditInvoice middleware handles ownership + status check
export const updateInvoice = async (req, res) => {
  try {
    const { customerName, date, subtotal, gstPercent = 18, status } = req.body;

    // Manually recalculate (findByIdAndUpdate skips pre-save hook)
    const sub   = Number(subtotal);
    const gstP  = Number(gstPercent);
    const gst   = Math.round((sub * gstP) / 100);
    const total = sub + gst;

    // Employee cannot change status (only admin can)
    const updateData = {
      customerName,
      date,
      subtotal: sub,
      gstPercent: gstP,
      gst,
      total,
    };

    if (req.user.role === "admin" && status) {
      updateData.status = status.toUpperCase();
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── DELETE INVOICE ───────────────────────────────────────────────────────────
// DELETE /api/invoices/:id
// Guard: adminOnly middleware already blocks employees before reaching here
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    res.status(200).json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};