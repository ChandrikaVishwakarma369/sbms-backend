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
  const { customerId, contact, products, address } = req.body;

  if (!customerId || !contact || !products || !products.length || !address) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: customerId, contact, products, and address are required.",
    });
  }

  if (typeof customerId !== "string" || customerId.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Invalid customer ID",
    });
  }

  if (typeof contact !== "string" || contact.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Invalid contact",
    });
  }

  if (typeof address !== "string" || address.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Invalid address",
    });
  }

  if (!Array.isArray(products)) {
    return res.status(400).json({
      success: false,
      message: "Products must be an array",
    });
  }

  for (const item of products) {
    if (!item.productId || typeof item.productId !== "string" || item.productId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Each product must have a valid product ID",
      });
    }

    if (isNaN(item.quantity) || Number(item.quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity for each product must be positive",
      });
    }
  }

  next();
};

// 🔹 Global Error Handler
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    status = 409;
    message = "Duplicate field value entered";
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    status = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  res.status(status).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};