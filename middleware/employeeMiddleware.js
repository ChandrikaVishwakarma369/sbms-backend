/**
 * EMPLOYEE MIDDLEWARE
 * Handles input validation for employee-related requests.
 */

const ALLOWED_ROLES = ["ADMIN", "EMPLOYEE"];

export const validateEmployeeInput = (req, res, next) => {
  const { name, email, role } = req.body;

  // Check required fields
  if (!name || !email || !role) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: name, email, and role are required.",
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

  // Validate role
  if (!ALLOWED_ROLES.includes(role.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(", ")}`,
    });
  }

  next();
};
