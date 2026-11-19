export const normalizeTenantRole = (role) => role === "admin" ? "tenant_admin" : role;

export const effectiveTenantRole = (membership) => {
  if (!membership || membership.status !== "active") return null;
  return normalizeTenantRole(membership.role);
};

export const canSwitchTenant = ({ membership, tenant }) => {
  if (!tenant || tenant.deletedAt) return false;
  if (!membership) return false;
  return membership.status === "active" && tenant.active;
};

export const canAssignTenantRole = ({ actorMembership, targetMembership, role }) => {
  if (!actorMembership || actorMembership.status !== "active") return false;
  if (normalizeTenantRole(actorMembership.role) !== "tenant_admin") return false;
  if (targetMembership && targetMembership.deletedAt) return false;
  return ["user", "provider", "tenant_admin"].includes(normalizeTenantRole(role));
};

export const canPlatformAdminAssignRole = (role) =>
  ["user", "provider", "tenant_admin", "platform_admin"].includes(normalizeTenantRole(role));

export const cannotModifyOwnMembership = (actorUserId, targetUserId) =>
  String(actorUserId) === String(targetUserId);

export const canRemoveTenantAdmin = ({ activeTenantAdminCount, targetRole, nextRole }) => {
  if (normalizeTenantRole(targetRole) !== "tenant_admin") return true;
  if (normalizeTenantRole(nextRole) === "tenant_admin") return true;
  return activeTenantAdminCount > 1;
};

export const canSuspendMembership = ({ activeTenantAdminCount, membership, nextStatus }) => {
  if (!["suspended", "revoked"].includes(nextStatus)) return true;
  if (normalizeTenantRole(membership?.role) !== "tenant_admin") return true;
  return activeTenantAdminCount > 1;
};
