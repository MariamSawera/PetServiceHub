import TenantMembership from "../models/TenantMembership.js";

export const requireTenantMembership = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (!req.tenantId) return res.status(400).json({ message: "Tenant context is required" });

  try {
    const membership = await TenantMembership.findOne({
      userId: req.user._id,
      tenantId: req.tenantId,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({ message: "No active membership for this tenant" });
    }

    req.membership = membership;
    req.tenantRole = membership.role;
    next();
  } catch (error) {
    console.error("requireTenantMembership error", error);
    return res.status(500).json({ message: "Could not verify tenant membership" });
  }
};
