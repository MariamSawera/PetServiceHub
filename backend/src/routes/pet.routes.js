import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import {
  createPet,
  deletePet,
  getPet,
  listPets,
  updatePet,
} from "../controllers/pet.controller.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", listPets);
router.post("/", createPet);
router.get("/:petId", getPet);
router.patch("/:petId", updatePet);
router.delete("/:petId", deletePet);

export default router;
