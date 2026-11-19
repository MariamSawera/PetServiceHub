import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeTenantRole,
  effectiveTenantRole,
  canSwitchTenant,
  canAssignTenantRole,
  canPlatformAdminAssignRole,
  cannotModifyOwnMembership,
  canRemoveTenantAdmin,
  canSuspendMembership,
} from "../src/services/permission.service.js";

test("normalizes legacy admin role", () => {
  assert.equal(normalizeTenantRole("admin"), "tenant_admin");
  assert.equal(normalizeTenantRole("tenant_admin"), "tenant_admin");
});

test("effective tenant role requires an active membership", () => {
  assert.equal(effectiveTenantRole({ role: "provider", status: "active" }), "provider");
  assert.equal(effectiveTenantRole({ role: "tenant_admin", status: "suspended" }), null);
});

test("tenant switching rejects inactive tenant, deleted tenant, and missing membership", () => {
  assert.equal(canSwitchTenant({ membership: { status: "active" }, tenant: { active: true, deletedAt: null } }), true);
  assert.equal(canSwitchTenant({ membership: null, tenant: { active: true, deletedAt: null } }), false);
  assert.equal(canSwitchTenant({ membership: { status: "active" }, tenant: { active: false, deletedAt: null } }), false);
  assert.equal(canSwitchTenant({ membership: { status: "active" }, tenant: { active: true, deletedAt: new Date() } }), false);
});

test("tenant admin can assign only tenant roles", () => {
  const actor = { role: "tenant_admin", status: "active" };
  assert.equal(canAssignTenantRole({ actorMembership: actor, role: "user" }), true);
  assert.equal(canAssignTenantRole({ actorMembership: actor, role: "provider" }), true);
  assert.equal(canAssignTenantRole({ actorMembership: actor, role: "tenant_admin" }), true);
  assert.equal(canAssignTenantRole({ actorMembership: actor, role: "platform_admin" }), false);
});

test("platform admin can assign tenant and platform roles", () => {
  assert.equal(canPlatformAdminAssignRole("user"), true);
  assert.equal(canPlatformAdminAssignRole("provider"), true);
  assert.equal(canPlatformAdminAssignRole("tenant_admin"), true);
  assert.equal(canPlatformAdminAssignRole("platform_admin"), true);
  assert.equal(canPlatformAdminAssignRole("owner"), false);
});

test("self membership modification is detected", () => {
  assert.equal(cannotModifyOwnMembership("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011"), true);
  assert.equal(cannotModifyOwnMembership("507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"), false);
});

test("last active tenant admin is protected", () => {
  assert.equal(canRemoveTenantAdmin({ activeTenantAdminCount: 1, targetRole: "tenant_admin", nextRole: "user" }), false);
  assert.equal(canRemoveTenantAdmin({ activeTenantAdminCount: 2, targetRole: "tenant_admin", nextRole: "user" }), true);
  assert.equal(canRemoveTenantAdmin({ activeTenantAdminCount: 1, targetRole: "tenant_admin", nextRole: "tenant_admin" }), true);
});

test("last tenant admin membership cannot be suspended or revoked", () => {
  assert.equal(canSuspendMembership({ activeTenantAdminCount: 1, membership: { role: "tenant_admin" }, nextStatus: "suspended" }), false);
  assert.equal(canSuspendMembership({ activeTenantAdminCount: 2, membership: { role: "tenant_admin" }, nextStatus: "revoked" }), true);
  assert.equal(canSuspendMembership({ activeTenantAdminCount: 1, membership: { role: "provider" }, nextStatus: "suspended" }), true);
});
