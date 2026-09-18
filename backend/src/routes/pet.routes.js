import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createPet,
  deletePet,
  getPet,
  listPets,
  listVaccinations,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  updatePet,
} from "../controllers/pet.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", listPets);
router.post("/", createPet);
router.get("/:petId/vaccinations", listVaccinations);
router.post("/:petId/vaccinations", createVaccination);
router.patch("/:petId/vaccinations/:vaccinationId", updateVaccination);
router.delete("/:petId/vaccinations/:vaccinationId", deleteVaccination);
router.get("/:petId", getPet);
router.patch("/:petId", updatePet);
router.delete("/:petId", deletePet);

export default router;
