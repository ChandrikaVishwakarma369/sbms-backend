import Invoice from "../models/Invoice.js";

// ─── 1. REQUEST BODY VALIDATION ───────────────────────────────────────────────
export const validateInvoiceBody = (req, res, next) => {
  const { customerName, date, dueDate, items, gstPercent } = req.body;
  const errors = {};

  if (!customerName?.trim())
    errors.customerName = "Customer name is required";

  if (!date)
    errors.date = "Invoice date is required";
  else if (isNaN(new Date(date).getTime()))
    errors.date = "Invalid date format";

  // ✅ dueDate — optional but agar hai toh invoice date se pehle nahi honi chahiye
  if (dueDate) {
    if (isNaN(new Date(dueDate).getTime()))
      errors.dueDate = "Invalid due date format";
    else if (date && new Date(dueDate) < new Date(date))
      errors.dueDate = "Due date cannot be before invoice date";
  }

  // ✅ Items validation — subtotal nahi, items validate karo
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.items = "At least one item is required";
  } else {
    items.forEach((item, i) => {
      if (!item.name?.trim())
        errors[`items[${i}].name`] = `Item ${i + 1}: name is required`;
      if (!item.qty || isNaN(item.qty) || Number(item.qty) <= 0)
        errors[`items[${i}].qty`] = `Item ${i + 1}: valid quantity required`;
      if (item.rate === undefined || isNaN(item.rate) || Number(item.rate) < 0)
        errors[`items[${i}].rate`] = `Item ${i + 1}: valid rate required`;
    });
  }

  const validGST = [0, 5, 12, 18, 28];
  if (gstPercent !== undefined && !validGST.includes(Number(gstPercent)))
    errors.gstPercent = `GST must be one of: ${validGST.join(", ")}`;

  // ✅ Status frontend se sirf PENDING ya PAID accept karo
  // OVERDUE manually set nahi hoga — system karega
  const { status } = req.body;
  if (status && !["PENDING", "PAID"].includes(status.toUpperCase()))
    errors.status = "Status must be PENDING or PAID";

  if (Object.keys(errors).length > 0)
    return res.status(400).json({ success: false, errors });

  next();
};


// ─── 2. ADMIN ONLY GUARD ──────────────────────────────────────────────────────
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only admin can perform this action.",
    });
  }
  next();
};


// ─── 3. CAN EDIT INVOICE GUARD ────────────────────────────────────────────────
export const canEditInvoice = async (req, res, next) => {
  try {
    if (req.user?.role === "admin") return next();

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice)
      return res.status(404).json({ success: false, message: "Invoice not found" });

    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only edit your own invoices.",
      });
    }

    // ✅ Employee sirf PENDING edit kar sakta hai
    // OVERDUE bhi lock hai — agar due date nikal gayi toh admin hi handle karega
    if (invoice.status !== "PENDING") {
      return res.status(403).json({
        success: false,
        message: `Cannot edit invoice with status "${invoice.status}". Only PENDING invoices can be edited.`,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};