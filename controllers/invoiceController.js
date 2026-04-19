import Invoice from "../models/Invoice.js";

const buildFilter = (user, extra = {}) => {
  const filter = { ...extra };
  if (user.role !== "admin") {
    filter.createdBy = user._id;
  }
  return filter;
};

// ✅ Helper: PENDING invoices jinki dueDate nikal gayi unhe OVERDUE mark karo
// Yeh GET all se pehle run hoga — DB mein status update karega
const syncOverdueStatuses = async (filter) => {
  const today = new Date(new Date().toDateString()); // time strip
  await Invoice.updateMany(
    {
      ...filter,
      status: "PENDING",
      dueDate: { $lt: today, $ne: null },
    },
    { $set: { status: "OVERDUE" } }
  );
};


// ─── GET ALL INVOICES ─────────────────────────────────────────────────────────
export const getAllInvoices = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const baseFilter = buildFilter(req.user);

    // ✅ Pehle overdue sync karo (sirf is user ke invoices)
    await syncOverdueStatuses(baseFilter);

    const filter = { ...baseFilter };

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
      .populate("createdBy", "name email role")
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


// ─── GET STATS ────────────────────────────────────────────────────────────────
export const getInvoiceStats = async (req, res) => {
  try {
    const baseFilter = buildFilter(req.user);

    // ✅ Stats se pehle bhi overdue sync
    await syncOverdueStatuses(baseFilter);

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


// ─── GET SINGLE ───────────────────────────────────────────────────────────────
export const getInvoiceById = async (req, res) => {
  try {
    const filter = buildFilter(req.user, { _id: req.params.id });
    const invoice = await Invoice.findOne(filter).populate("createdBy", "name email role");

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found or access denied." });

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ─── CREATE INVOICE ───────────────────────────────────────────────────────────
export const createInvoice = async (req, res) => {
  try {
    const {
      customerName,
      date,
      dueDate,          // ✅ NEW
      items,            // ✅ NEW — subtotal nahi
      gstPercent = 18,
      status = "PENDING",
      paymentMethod,    // ✅ NEW
      notes,            // ✅ NEW
    } = req.body;

    const invoice = await Invoice.create({
      customerName,
      date,
      dueDate:       dueDate || null,
      items,                            // pre-save hook amounts + subtotal calculate karega
      gstPercent:    Number(gstPercent),
      status:        status.toUpperCase(),
      paymentMethod: paymentMethod || null,
      notes:         notes || null,
      createdBy:     req.user._id,
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

    // ✅ findByIdAndUpdate pre-save hook nahi chalata
    // Toh manually items amounts + subtotal + gst + total calculate karo
    const cleanItems = items.map((item) => ({
      name:   item.name.trim(),
      qty:    Number(item.qty),
      rate:   Number(item.rate),
      amount: Math.round(Number(item.qty) * Number(item.rate)),
    }));

    const subtotal = cleanItems.reduce((sum, item) => sum + item.amount, 0);
    const gstP     = Number(gstPercent);
    const gst      = Math.round((subtotal * gstP) / 100);
    const total    = subtotal + gst;

    const updateData = {
      customerName,
      date,
      dueDate:       dueDate || null,
      items:         cleanItems,
      subtotal,
      gstPercent:    gstP,
      gst,
      total,
      paymentMethod: paymentMethod || null,
      notes:         notes || null,
    };

    // ✅ Employee status change nahi kar sakta
    // Admin PENDING ↔ PAID toggle kar sakta hai (OVERDUE system set karega)
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