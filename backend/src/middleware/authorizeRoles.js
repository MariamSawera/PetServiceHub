const normalizeRole = (role) => role === "admin" ? "tenant_admin" : role;

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const normalizedRoles = roles.map(normalizeRole);
    const effectiveRole = req.tenantRole
      || req.membership?.role
      || (req.isPlatformAdmin ? "platform_admin" : null);

    if (!effectiveRole || !normalizedRoles.includes(normalizeRole(effectiveRole))) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

export default authorizeRoles;
