import AuditLog from "../models/AuditLog.js";

export const createAuditLog = async (req, {
  action,
  targetType,
  targetId,
  tenantId,
  details = {},
}) => {
  if (!req.user) return null;
  return AuditLog.create({
    actor: req.user._id,
    actorName: req.user.name,
    actorEmail: req.user.email,
    actorRole: req.user.role,
    action,
    targetType,
    targetId,
    tenantId,
    details,
    ipAddress: req.ip || "",
    userAgent: req.get?.("user-agent") || "",
  });
};
