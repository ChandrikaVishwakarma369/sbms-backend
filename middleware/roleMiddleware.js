/**
 * ROLE-BASED ACCESS CONTROL (RBAC)
 * Defines authorization rules for employees.
 */

// MANAGER | ADMIN: Can edit, but MANAGER can't delete.
export const canEdit = (req, res, next) => {
  const role = req.user?.role?.toUpperCase();
  if (["ADMIN", "MANAGER"].includes(role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access Denied: Managers or Admins only.",
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
