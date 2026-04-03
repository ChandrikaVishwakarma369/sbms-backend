// ==========================================
// 📦 ORDER MIDDLEWARE
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

// 🔹 Order Validation
export const validateOrderInput = (req, res, next) => {
  const { customer, contact, product, amount, address } = req.body;

  if (!customer || !contact || !product || !amount) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  if (typeof customer !== "string" || customer.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Invalid customer",
    });
  }

  if (typeof contact !== "string" || contact.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Invalid contact",
    });
  }

  if (typeof product !== "string" || product.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Invalid product",
    });
  }

  if (address && (typeof address !== "string" || address.trim() === "")) {
    return res.status(400).json({
      success: false,
      message: "Invalid address",
    });
  }

  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be positive",
    });
  }

  next();
};

// 🔹 Global Error Handler
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};