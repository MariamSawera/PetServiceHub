import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { requirePlatformAdmin } from "../middleware/requirePlatformAdmin.js";
import {
  createPlatformTenant,
  deletePlatformClinic,
  deletePlatformPost,
  deletePlatformTenant,
  getPlatformOverview,
  listPlatformAuditLogs,
  listPlatformMemberships,
  listPlatformClinics,
  listPlatformPosts,
  listPlatformTenants,
  listPlatformUsers,
  updatePlatformTenant,
  updatePlatformUser,
  updatePlatformAccountStatus,
  updatePlatformMembershipStatus,
} from "../controllers/platformAdmin.controller.js";

const router = express.Router();

router.use(protectRoute, requirePlatformAdmin);

router.get("/overview", getPlatformOverview);
router.get("/tenants", listPlatformTenants);
router.post("/tenants", createPlatformTenant);
router.patch("/tenants/:tenantId", updatePlatformTenant);
router.delete("/tenants/:tenantId", deletePlatformTenant);
router.get("/users", listPlatformUsers);
router.patch("/users/:userId", updatePlatformUser);
router.patch("/users/:userId/account-status", updatePlatformAccountStatus);
router.get("/memberships", listPlatformMemberships);
router.patch("/memberships/:membershipId/status", updatePlatformMembershipStatus);
router.get("/clinics", listPlatformClinics);
router.delete("/clinics/:clinicId", deletePlatformClinic);
router.get("/posts", listPlatformPosts);
router.delete("/posts/:postId", deletePlatformPost);
router.get("/audit-logs", listPlatformAuditLogs);

export default router;
