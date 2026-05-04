/**
 * EMPLOYEE MIDDLEWARE
 * Handles input validation for employee-related requests.
 */

const ALLOWED_ROLES = ["ADMIN", "EMPLOYEE"];

export const validateEmployeeInput = (req, res, next) => {
  const { name, email } = req.body;

  // Check required fields
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name and email are required.",
    });
  }

  // Validate email format (basic check)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format.",
    });
  }

  next();
};

