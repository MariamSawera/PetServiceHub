import express from "express";
import authorizeRoles from "../middleware/authorizeRoles.js";
import protectRoute from "../middleware/protectRoute.js";
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
router.get("/mine", protectRoute, authorizeRoles("provider"), listOwnedClinics);
router.get("/:clinicId", getClinic);

router.use(protectRoute, authorizeRoles("provider"));
router.post("/", createClinic);
router.patch("/:clinicId", updateClinic);
router.delete("/:clinicId", deleteClinic);

export default router;