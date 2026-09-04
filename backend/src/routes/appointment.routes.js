import express from "express";
import authorizeRoles from "../middleware/authorizeRoles.js";
import protectRoute from "../middleware/protectRoute.js";
import { cancelAppointment, createAppointment, getAppointment, listProviderAppointments, listUserAppointments, updateAppointmentStatus } from "../controllers/appointment.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", listUserAppointments);
router.post("/", createAppointment);
router.get("/provider", authorizeRoles("provider"), listProviderAppointments);
router.patch("/provider/:appointmentId/status", authorizeRoles("provider"), updateAppointmentStatus);
router.patch("/:appointmentId/cancel", cancelAppointment);
router.get("/:appointmentId", getAppointment);

export default router;