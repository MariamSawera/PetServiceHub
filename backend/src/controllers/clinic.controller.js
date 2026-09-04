import mongoose from "mongoose";
import Clinic from "../models/Clinic.js";

const CLINIC_FIELDS = [
  "name",
  "description",
  "phone",
  "email",
  "website",
  "address",
  "city",
  "state",
  "postalCode",
  "location",
  "image",
  "specialties",
  "services",
];

const clinicPayload = (body = {}) => {
  return CLINIC_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
    return payload;
  }, {});
};

const invalidId = (id) => !mongoose.isValidObjectId(id);

const queryNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const listClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find().sort({ createdAt: -1 });
    return res.json(clinics);
  } catch (error) {
    console.error("listClinics error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const createClinic = async (req, res) => {
  try {
    const clinic = await Clinic.create({
      ...clinicPayload(req.body),
      owner: req.user._id,
    });
    return res.status(201).json(clinic);
  } catch (error) {
    console.error("createClinic error", error);
    return res.status(400).json({ message: "Invalid clinic data" });
  }
};

export const getClinic = async (req, res) => {
  if (invalidId(req.params.clinicId)) {
    return res.status(404).json({ message: "Clinic not found" });
  }

  try {
    const clinic = await Clinic.findById(req.params.clinicId);

    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    return res.json(clinic);
  } catch (error) {
    console.error("getClinic error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateClinic = async (req, res) => {
  if (invalidId(req.params.clinicId)) {
    return res.status(404).json({ message: "Clinic not found" });
  }

  try {
    const clinic = await Clinic.findOneAndUpdate(
      { _id: req.params.clinicId, owner: req.user._id },
      { $set: clinicPayload(req.body) },
      { new: true, runValidators: true }
    );

    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    return res.json(clinic);
  } catch (error) {
    console.error("updateClinic error", error);
    return res.status(400).json({ message: "Invalid clinic data" });
  }
};

export const deleteClinic = async (req, res) => {
  if (invalidId(req.params.clinicId)) {
    return res.status(404).json({ message: "Clinic not found" });
  }

  try {
    const clinic = await Clinic.findOneAndDelete({
      _id: req.params.clinicId,
      owner: req.user._id,
    });

    if (!clinic) {
      return res.status(404).json({ message: "Clinic not found" });
    }

    return res.json({ message: "Clinic deleted successfully" });
  } catch (error) {
    console.error("deleteClinic error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const listOwnedClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json(clinics);
  } catch (error) {
    console.error("listOwnedClinics error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const listNearbyClinics = async (req, res) => {
  const longitude = Number(req.query.longitude);
  const latitude = Number(req.query.latitude);

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180 || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return res.status(400).json({ message: "Valid longitude and latitude are required" });
  }

  const maxDistance = Math.min(Math.max(queryNumber(req.query.maxDistance, 25000), 100), 100000);
  const limit = Math.min(Math.max(Math.trunc(queryNumber(req.query.limit, 20)), 1), 100);
  const match = {};

  if (req.query.city) match.city = new RegExp(`^${req.query.city.trim()}$`, "i");
  if (req.query.specialty) match.specialties = new RegExp(req.query.specialty.trim(), "i");

  try {
    const clinics = await Clinic.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          key: "location",
          distanceField: "distanceMeters",
          maxDistance,
          spherical: true,
        },
      },
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      { $limit: limit },
      { $addFields: { distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 1] } } },
    ]);

    return res.json(clinics);
  } catch (error) {
    console.error("listNearbyClinics error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};