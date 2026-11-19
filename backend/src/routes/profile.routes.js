import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { requireTenantMembership } from "../middleware/requireTenantMembership.js";
import { getProfile, upsertProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.use(protectRoute, requireTenantMembership);
router.get("/", getProfile);
router.put("/", upsertProfile);

export default router;
