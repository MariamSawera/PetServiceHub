import mongoose from "mongoose";
import Pet from "../models/Pet.js";

const PET_FIELDS = [
  "name",
  "species",
  "breed",
  "gender",
  "dateOfBirth",
  "weight",
  "image",
  "medicalInfo",
  "vaccinations",
];

const petPayload = (body = {}) => {
  return PET_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
    return payload;
  }, {});
};

const invalidId = (id) => !mongoose.isValidObjectId(id);

const vaccinationPayload = (body = {}) => {
  const fields = ["vaccineName", "dateAdministered", "nextDueDate", "veterinarian", "notes"];
  return fields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
    return payload;
  }, {});
};

export const listPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id, tenantId: req.tenantId }).sort({ createdAt: -1 });
    return res.json(pets);
  } catch (error) {
    console.error("listPets error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const createPet = async (req, res) => {
  try {
    const pet = await Pet.create({ ...petPayload(req.body), owner: req.user._id, tenantId: req.tenantId });
    return res.status(201).json(pet);
  } catch (error) {
    console.error("createPet error", error);
    return res.status(400).json({ message: "Invalid pet data" });
  }
};

export const getPet = async (req, res) => {
  if (invalidId(req.params.petId)) {
    return res.status(404).json({ message: "Pet not found" });
  }

  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.user._id, tenantId: req.tenantId });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    return res.json(pet);
  } catch (error) {
    console.error("getPet error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updatePet = async (req, res) => {
  if (invalidId(req.params.petId)) {
    return res.status(404).json({ message: "Pet not found" });
  }

  try {
    const pet = await Pet.findOneAndUpdate(
      { _id: req.params.petId, owner: req.user._id, tenantId: req.tenantId },
      { $set: petPayload(req.body) },
      { new: true, runValidators: true }
    );

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    return res.json(pet);
  } catch (error) {
    console.error("updatePet error", error);
    return res.status(400).json({ message: "Invalid pet data" });
  }
};

export const deletePet = async (req, res) => {
  if (invalidId(req.params.petId)) {
    return res.status(404).json({ message: "Pet not found" });
  }

  try {
    const pet = await Pet.findOneAndDelete({ _id: req.params.petId, owner: req.user._id, tenantId: req.tenantId });

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    return res.json({ message: "Pet deleted successfully" });
  } catch (error) {
    console.error("deletePet error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const listVaccinations = async (req, res) => {
  if (invalidId(req.params.petId)) {
    return res.status(404).json({ message: "Pet not found" });
  }

  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.user._id, tenantId: req.tenantId }).select("vaccinations");
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    return res.json(pet.vaccinations.sort((first, second) => new Date(second.dateAdministered) - new Date(first.dateAdministered)));
  } catch (error) {
    console.error("listVaccinations error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const createVaccination = async (req, res) => {
  if (invalidId(req.params.petId)) {
    return res.status(404).json({ message: "Pet not found" });
  }

  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.user._id, tenantId: req.tenantId });
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    pet.vaccinations.push(vaccinationPayload(req.body));
    await pet.save();
    return res.status(201).json(pet.vaccinations.at(-1));
  } catch (error) {
    console.error("createVaccination error", error);
    return res.status(400).json({ message: "Invalid vaccination data" });
  }
};

export const updateVaccination = async (req, res) => {
  if (invalidId(req.params.petId) || invalidId(req.params.vaccinationId)) {
    return res.status(404).json({ message: "Vaccination not found" });
  }

  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.user._id, tenantId: req.tenantId });
    const vaccination = pet?.vaccinations.id(req.params.vaccinationId);
    if (!vaccination) {
      return res.status(404).json({ message: "Vaccination not found" });
    }

    Object.assign(vaccination, vaccinationPayload(req.body));
    await pet.save();
    return res.json(vaccination);
  } catch (error) {
    console.error("updateVaccination error", error);
    return res.status(400).json({ message: "Invalid vaccination data" });
  }
};

export const deleteVaccination = async (req, res) => {
  if (invalidId(req.params.petId) || invalidId(req.params.vaccinationId)) {
    return res.status(404).json({ message: "Vaccination not found" });
  }

  try {
    const pet = await Pet.findOne({ _id: req.params.petId, owner: req.user._id, tenantId: req.tenantId });
    const vaccination = pet?.vaccinations.id(req.params.vaccinationId);
    if (!vaccination) {
      return res.status(404).json({ message: "Vaccination not found" });
    }

    vaccination.deleteOne();
    await pet.save();
    return res.json({ message: "Vaccination deleted successfully" });
  } catch (error) {
    console.error("deleteVaccination error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
