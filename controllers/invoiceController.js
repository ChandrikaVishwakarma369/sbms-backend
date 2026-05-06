import Invoice from "../models/Invoice.js";

// ─── COMMON FILTER ────────────────────────────────────────────────────────────
const buildFilter = (user, extra = {}) => {
  const filter = { ...extra };
  if (user.role !== "admin") {
    filter.createdBy = user._id;
  }
  return filter;
};

// ─── SYNC OVERDUE ─────────────────────────────────────────────────────────────
const syncOverdueStatuses = async (filter) => {
  const today = new Date(new Date().toDateString());

  await Invoice.updateMany(
    {
      ...filter,
      status: "PENDING",
      dueDate: { $lt: today, $ne: null },
    },
    { $set: { status: "OVERDUE" } },
  );
};

// ─── GET ALL ──────────────────────────────────────────────────────────────────
export const getAllInvoices = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const baseFilter = buildFilter(req.user);
    await syncOverdueStatuses(baseFilter);

    const filter = { ...baseFilter };

    if (status && status !== "All Status") {
      filter.status = status.toUpperCase();
    }

    if (search.trim()) {
      filter.$or = [
        { invoiceId: { $regex: search.trim(), $options: "i" } },
        { customerName: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Invoice.countDocuments(filter);

    const invoices = await Invoice.find(filter)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET STATS (FIXED) ────────────────────────────────────────────────────────
export const getInvoiceStats = async (req, res) => {
  try {
    const baseFilter = buildFilter(req.user);
    await syncOverdueStatuses(baseFilter);

    const invoices = await Invoice.find(baseFilter);

    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    invoices.forEach((inv) => {
      if (inv.status === "PAID") {
        totalPaid += inv.total;
      }

      if (inv.status === "PENDING") {
        totalPending += inv.total;
      }

      if (inv.status === "OVERDUE") {
        totalOverdue += inv.total;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalPaid,
        totalPending,
        totalOverdue,
      },
    });
  } catch (error) {
    console.error("STATS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ─── GET SINGLE INVOICE ─────────────────────────────────────────────
export const getInvoiceById = async (req, res) => {
  try {
    const filter = buildFilter(req.user, { _id: req.params.id });

    const invoice = await Invoice.findOne(filter).populate(
      "createdBy",
      "name email role",
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found or access denied.",
      });
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error("GET ONE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── CREATE INVOICE (FIXED UNIQUE ID) ─────────────────────────────────────────
export const createInvoice = async (req, res) => {
  try {
    const {
      customerName,
      date,
      dueDate,
      items,
      gstPercent = 18,
      status = "PENDING",
      paymentMethod,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

    // 🔥 UNIQUE ID LOOP (IMPORTANT FIX)
    let invoiceId;
    let exists = true;

    while (exists) {
      const random = Math.floor(100 + Math.random() * 900);
      invoiceId = `INV${random}`;

      const found = await Invoice.findOne({ invoiceId });
      if (!found) exists = false;
    }

    const cleanItems = items.map((item) => ({
      name: item.name?.trim(),
      qty: Number(item.qty),
      rate: Number(item.rate),
      amount: Math.round(Number(item.qty) * Number(item.rate)),
    }));

    const subtotal = cleanItems.reduce((sum, item) => sum + item.amount, 0);
    const gst = Math.round((subtotal * Number(gstPercent)) / 100);
    const total = subtotal + gst;

    const invoice = await Invoice.create({
      invoiceId,
      customerName,
      date: new Date(date), // 🔥 IMPORTANT FIX
      dueDate: dueDate ? new Date(dueDate) : null,
      items: cleanItems,
      subtotal,
      gstPercent: Number(gstPercent),
      gst,
      total,
      status: status.toUpperCase(),
      paymentMethod: paymentMethod || null,
      notes: notes || null,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── UPDATE INVOICE ───────────────────────────────────────────────────────────
export const updateInvoice = async (req, res) => {
  try {
    const {
      customerName,
      date,
      dueDate,
      items,
      gstPercent = 18,
      status,
      paymentMethod,
      notes,
    } = req.body;

    const cleanItems = items.map((item) => ({
      name: item.name?.trim(),
      qty: Number(item.qty),
      rate: Number(item.rate),
      amount: Math.round(Number(item.qty) * Number(item.rate)),
    }));

    const subtotal = cleanItems.reduce((sum, item) => sum + item.amount, 0);
    const gst = Math.round((subtotal * Number(gstPercent)) / 100);
    const total = subtotal + gst;

    const updateData = {
      customerName,
      date: new Date(date),
      dueDate: dueDate ? new Date(dueDate) : null,
      items: cleanItems,
      subtotal,
      gstPercent: Number(gstPercent),
      gst,
      total,
      paymentMethod: paymentMethod || null,
      notes: notes || null,
    };

    if (status) {
      updateData.status = status.toUpperCase();
    }
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET PENDING INVOICES ──────────────────────────────────────────────────────
export const getPendingInvoices = async (req, res) => {
  try {
    const baseFilter = buildFilter(req.user);
    await syncOverdueStatuses(baseFilter);

    // Fetch both PENDING and OVERDUE as they are both "pending payments"
    const pendingFilter = {
      ...baseFilter,
      status: { $in: ["PENDING", "OVERDUE"] }
    };

    const invoices = await Invoice.find(pendingFilter)
      .sort({ dueDate: 1 })
      .limit(10); // Limit to top 10 for dashboard widget

    const totalPending = invoices.reduce((sum, inv) => sum + inv.total, 0);

    res.status(200).json({
      success: true,
      data: {
        totalPending,
        count: invoices.length,
        invoices: invoices.map(inv => ({
          id: inv._id,
          customer: inv.customerName,
          amount: inv.total,
          dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
          }) : "N/A"
        }))
      },
    });
  } catch (error) {
    console.error("PENDING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};