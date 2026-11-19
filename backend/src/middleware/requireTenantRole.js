const normalizeRole = (role) => role === "admin" ? "tenant_admin" : role;

export const requireTenantRole = (...allowedRoles) => {
  const normalizedRoles = allowedRoles.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Authentication required" });
    if (!req.membership || req.membership.status !== "active") {
      return res.status(403).json({ message: "Active tenant membership required" });
    }

    if (!normalizedRoles.includes(req.membership.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    req.tenantRole = req.membership.role;
    next();
  };
};
