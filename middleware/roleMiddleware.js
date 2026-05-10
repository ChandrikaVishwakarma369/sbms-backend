/**
 * ROLE-BASED ACCESS CONTROL (RBAC)
 * Defines authorization rules for employees.
 */

// ADMIN: Can edit.
export const canEdit = (req, res, next) => {
  const role = req.user?.role?.toUpperCase();
  if (role === "ADMIN") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access Denied: Admin level required.",
  });
};

// ADMIN ONLY: Exclusive delete access.
export const canDelete = (req, res, next) => {
  const role = req.user?.role?.toUpperCase();
  if (role === "ADMIN") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access Denied: Admin level required to delete records.",
  });
};

// READ ONLY: Fallback - any authenticated user can view (handled via GET /protect in routes)

// Generic role-based access control factory
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized: No user found in request",
      });
    }

    const userRole = req.user.role?.toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

    if (normalizedAllowedRoles.includes(userRole)) {
      return next();
    }

    const message = normalizedAllowedRoles.length === 1 && normalizedAllowedRoles[0] === "ADMIN"
      ? "Access denied: Administrative privileges required."
      : `Access denied. Authorized roles: ${allowedRoles.join(", ")}`;

    return res.status(403).json({
      success: false,
      message: message,
    });
  };
};
