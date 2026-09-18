import express from "express";
import authorizeRoles from "../middleware/authorizeRoles.js";
import protectRoute from "../middleware/protectRoute.js";
import { createTenant } from "../controllers/tenant.controller.js";

const router = express.Router();

router.post("/", protectRoute, authorizeRoles("admin"), createTenant);

export default router;