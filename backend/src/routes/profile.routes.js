import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getProfile, upsertProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getProfile);
router.put("/", upsertProfile);

export default router;
