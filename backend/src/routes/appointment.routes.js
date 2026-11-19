import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { requireTenantMembership } from "../middleware/requireTenantMembership.js";
import { requireTenantRole } from "../middleware/requireTenantRole.js";
import { cancelAppointment, createAppointment, getAppointment, listProviderAppointments, listUserAppointments, updateAppointmentStatus } from "../controllers/appointment.controller.js";

const router = express.Router();

router.use(protectRoute, requireTenantMembership);
router.get("/", listUserAppointments);
router.post("/", createAppointment);
router.get("/provider", requireTenantRole("provider"), listProviderAppointments);
router.patch("/provider/:appointmentId/status", requireTenantRole("provider"), updateAppointmentStatus);
router.patch("/:appointmentId/cancel", cancelAppointment);
router.get("/:appointmentId", getAppointment);

export default router;