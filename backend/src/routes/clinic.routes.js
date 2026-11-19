import express from "express";
import authorizeRoles from "../middleware/authorizeRoles.js";
import protectRoute from "../middleware/protectRoute.js";
import { requireTenantRole } from "../middleware/requireTenantRole.js";
import {
  createClinic,
  deleteClinic,
  getClinic,
  listOwnedClinics,
  listClinics,
  listNearbyClinics,
  updateClinic,
} from "../controllers/clinic.controller.js";

const router = express.Router();

router.get("/", listClinics);
router.get("/nearby", listNearbyClinics);
router.get("/mine", protectRoute, requireTenantRole("provider"), listOwnedClinics);
router.get("/:clinicId", getClinic);

router.use(protectRoute, requireTenantRole("provider"));
router.post("/", createClinic);
router.patch("/:clinicId", updateClinic);
router.delete("/:clinicId", deleteClinic);

export default router;