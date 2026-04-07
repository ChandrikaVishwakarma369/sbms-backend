export const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: "User not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Admin access required" });
  }

  next();
};
