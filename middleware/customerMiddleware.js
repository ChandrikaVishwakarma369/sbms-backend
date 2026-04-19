// ==========================================
// 👥 CUSTOMER MIDDLEWARE
// ==========================================

// 🔹 Request Logger
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;

    const icon =
      status >= 400 ? "❌" : status >= 300 ? "⚠️" : "✅";

    console.log(
      `${icon} [${req.method}] ${req.originalUrl} - ${status} - ${duration}ms`
    );
  });

  next();
};

// 🔹 Customer Validation
export const validateCustomerInput = (req, res, next) => {
  const { name, email, phone, gstNumber } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, email, and phone are required",
    });
  }

  // Basic Name Validation
  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid name: must be a non-empty string",
    });
  }

  // Basic Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  // Basic Phone Validation
  if (typeof phone !== "string" || phone.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number: must be at least 10 characters",
    });
  }

  // GST Validation (optional but format check if provided)
  if (gstNumber) {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid GST format (e.g. 22AAAAA0000A1Z5)",
      });
    }
  }

  next();
};

// 🔹 Global Error Handler for Customers
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Customer API Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
