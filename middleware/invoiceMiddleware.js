import Invoice from "../models/Invoice.js";

// ─── 1. REQUEST BODY VALIDATION ───────────────────────────────────────────────
export const validateInvoiceBody = (req, res, next) => {
  const { customerName, date, subtotal, gstPercent, status } = req.body;
  const errors = {};

  if (!customerName?.trim())
    errors.customerName = "Customer name is required";

  if (!date)
    errors.date = "Invoice date is required";
  else if (isNaN(new Date(date).getTime()))
    errors.date = "Invalid date format";

  if (subtotal === undefined || subtotal === "")
    errors.subtotal = "Subtotal is required";
  else if (isNaN(subtotal) || Number(subtotal) <= 0)
    errors.subtotal = "Subtotal must be a positive number";

  const validGST = [0, 5, 12, 18, 28];
  if (gstPercent !== undefined && !validGST.includes(Number(gstPercent)))
    errors.gstPercent = `GST must be one of: ${validGST.join(", ")}`;

  const validStatus = ["PENDING", "PAID", "OVERDUE"];
  if (status && !validStatus.includes(status.toUpperCase()))
    errors.status = `Status must be one of: ${validStatus.join(", ")}`;

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

    // Ownership check
    if (invoice.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only edit your own invoices.",
      });
    }

    // Status check 
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