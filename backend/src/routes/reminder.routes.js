import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { listReminders } from "../controllers/reminder.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", listReminders);

export default router;