import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", listNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:notificationId/read", markNotificationRead);

export default router;
