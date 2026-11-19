import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { requireTenantRole } from "../middleware/requireTenantRole.js";
import {
  deleteAdminClinic,
  deleteAdminPost,
  deleteAdminReview,
  getAdminOverview,
  listAdminAppointments,
  listAdminClinics,
  listAdminPosts,
  listAdminReviews,
  listAdminUsers,
  updateAdminAppointment,
  updateAdminUser,
  listTenantAuditLogs,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protectRoute, requireTenantRole("tenant_admin"));

router.get("/overview", getAdminOverview);
router.get("/users", listAdminUsers);
router.patch("/users/:userId", updateAdminUser);
router.get("/clinics", listAdminClinics);
router.delete("/clinics/:clinicId", deleteAdminClinic);
router.get("/appointments", listAdminAppointments);
router.patch("/appointments/:appointmentId", updateAdminAppointment);
router.get("/reviews", listAdminReviews);
router.delete("/reviews/:reviewId", deleteAdminReview);
router.get("/posts", listAdminPosts);
router.delete("/posts/:postId", deleteAdminPost);
router.get("/audit-logs", listTenantAuditLogs);

export default router;
