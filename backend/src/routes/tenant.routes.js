import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { requirePlatformAdmin } from "../middleware/requirePlatformAdmin.js";
import { createTenant } from "../controllers/tenant.controller.js";

const router = express.Router();

router.post("/", protectRoute, requirePlatformAdmin, createTenant);

export default router;