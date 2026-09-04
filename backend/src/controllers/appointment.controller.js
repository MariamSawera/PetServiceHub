import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Clinic from "../models/Clinic.js";
import Pet from "../models/Pet.js";

const invalidId = (id) => !mongoose.isValidObjectId(id);

const appointmentQuery = (query) => query.populate("pet", "name species").populate("clinic", "name city owner").populate("user", "name email").sort({ date: 1, createdAt: -1 });

export const createAppointment = async (req, res) => {
  const { pet, clinic, service, date, time, notes } = req.body;
  if ([pet, clinic, service, date, time].some((value) => !value) || invalidId(pet) || invalidId(clinic)) {
    return res.status(400).json({ message: "Pet, clinic, service, date, and time are required" });
  }

  try {
    const [ownedPet, existingClinic] = await Promise.all([
      Pet.findOne({ _id: pet, owner: req.user._id }),
      Clinic.findById(clinic),
    ]);
    if (!ownedPet) return res.status(404).json({ message: "Pet not found" });
    if (!existingClinic) return res.status(404).json({ message: "Clinic not found" });

    const appointment = await Appointment.create({ user: req.user._id, pet, clinic, service, date, time, notes });
    return res.status(201).json(await appointmentQuery(Appointment.findById(appointment._id)));
  } catch (error) {
    console.error("createAppointment error", error);
    return res.status(400).json({ message: "Invalid appointment data" });
  }
};

export const listUserAppointments = async (req, res) => {
  try { return res.json(await appointmentQuery(Appointment.find({ user: req.user._id }))); }
  catch (error) { console.error("listUserAppointments error", error); return res.status(500).json({ message: "Server Error" }); }
};

export const getAppointment = async (req, res) => {
  if (invalidId(req.params.appointmentId)) return res.status(404).json({ message: "Appointment not found" });
  try {
    const appointment = await appointmentQuery(Appointment.findOne({ _id: req.params.appointmentId, user: req.user._id }));
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    return res.json(appointment);
  } catch (error) { console.error("getAppointment error", error); return res.status(500).json({ message: "Server Error" }); }
};

export const listProviderAppointments = async (req, res) => {
  try {
    const clinics = await Clinic.find({ owner: req.user._id }).select("_id");
    return res.json(await appointmentQuery(Appointment.find({ clinic: { $in: clinics.map((clinic) => clinic._id) } })));
  } catch (error) { console.error("listProviderAppointments error", error); return res.status(500).json({ message: "Server Error" }); }
};

export const updateAppointmentStatus = async (req, res) => {
  if (invalidId(req.params.appointmentId)) return res.status(404).json({ message: "Appointment not found" });
  const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ message: "Invalid appointment status" });
  try {
    const clinics = await Clinic.find({ owner: req.user._id }).select("_id");
    const appointment = await appointmentQuery(Appointment.findOneAndUpdate({ _id: req.params.appointmentId, clinic: { $in: clinics.map((clinic) => clinic._id) } }, { status: req.body.status }, { new: true, runValidators: true }));
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    return res.json(appointment);
  } catch (error) { console.error("updateAppointmentStatus error", error); return res.status(400).json({ message: "Could not update appointment" }); }
};

export const cancelAppointment = async (req, res) => {
  if (invalidId(req.params.appointmentId)) return res.status(404).json({ message: "Appointment not found" });
  try {
    const appointment = await appointmentQuery(Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, user: req.user._id, status: { $in: ["pending", "confirmed"] } },
      { status: "cancelled" },
      { new: true, runValidators: true }
    ));
    if (!appointment) return res.status(404).json({ message: "Appointment not found or cannot be cancelled" });
    return res.json(appointment);
  } catch (error) { console.error("cancelAppointment error", error); return res.status(500).json({ message: "Server Error" }); }
};