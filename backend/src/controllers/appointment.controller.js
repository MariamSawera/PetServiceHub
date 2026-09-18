import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Clinic from "../models/Clinic.js";
import Pet from "../models/Pet.js";
import { createAppointmentNotification } from "../services/notification.service.js";

const invalidId = (id) => !mongoose.isValidObjectId(id);
const appointmentQuery = (query) => query.populate("pet", "name species").populate("clinic", "name city owner").populate("user", "name email").sort({ date: 1, createdAt: -1 });

export const createAppointment = async (req, res) => {
  const { pet, clinic, service, date, time, notes } = req.body;
  if ([pet, clinic, service, date, time].some((value) => !value) || invalidId(pet) || invalidId(clinic)) return res.status(400).json({ message: "Pet, clinic, service, date, and time are required" });
  try {
    const [ownedPet, existingClinic] = await Promise.all([
      Pet.findOne({ _id: pet, owner: req.user._id, tenantId: req.tenantId }),
      Clinic.findOne({ _id: clinic, tenantId: req.tenantId }),
    ]);
    if (!ownedPet) return res.status(404).json({ message: "Pet not found" });
    if (!existingClinic) return res.status(404).json({ message: "Clinic not found" });
    const appointment = await Appointment.create({ user: req.user._id, pet, clinic, service, date, time, notes, tenantId: req.tenantId });
    createAppointmentNotification({ ...appointment.toObject(), pet: ownedPet }, "appointment_created").catch((error) => console.error("create appointment notification error", error));
    return res.status(201).json(await appointmentQuery(Appointment.findOne({ _id: appointment._id, tenantId: req.tenantId })));
  } catch (error) {
    console.error("createAppointment error", error);
    return res.status(400).json({ message: "Invalid appointment data" });
  }
};

export const listUserAppointments = async (req, res) => {
  try { return res.json(await appointmentQuery(Appointment.find({ user: req.user._id, tenantId: req.tenantId }))); }
  catch (error) { console.error("listUserAppointments error", error); return res.status(500).json({ message: "Server Error" }); }
};

export const getAppointment = async (req, res) => {
  if (invalidId(req.params.appointmentId)) return res.status(404).json({ message: "Appointment not found" });
  try {
    const appointment = await appointmentQuery(Appointment.findOne({ _id: req.params.appointmentId, user: req.user._id, tenantId: req.tenantId }));
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    return res.json(appointment);
  } catch (error) { console.error("getAppointment error", error); return res.status(500).json({ message: "Server Error" }); }
};

export const listProviderAppointments = async (req, res) => {
  try {
    const clinics = await Clinic.find({ owner: req.user._id, tenantId: req.tenantId }).select("_id");
    return res.json(await appointmentQuery(Appointment.find({ tenantId: req.tenantId, clinic: { $in: clinics.map((clinic) => clinic._id) } })));
  } catch (error) { console.error("listProviderAppointments error", error); return res.status(500).json({ message: "Server Error" }); }
};

export const updateAppointmentStatus = async (req, res) => {
  if (invalidId(req.params.appointmentId)) return res.status(404).json({ message: "Appointment not found" });
  const allowedStatuses = ["pending", "confirmed", "completed", "cancelled"];
  if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ message: "Invalid appointment status" });
  try {
    const clinics = await Clinic.find({ owner: req.user._id, tenantId: req.tenantId }).select("_id");
    const appointmentToUpdate = await Appointment.findOne({ _id: req.params.appointmentId, tenantId: req.tenantId, clinic: { $in: clinics.map((clinic) => clinic._id) } }).populate("pet", "name");
    if (!appointmentToUpdate) return res.status(404).json({ message: "Appointment not found" });
    const previousStatus = appointmentToUpdate.status;
    appointmentToUpdate.status = req.body.status;
    await appointmentToUpdate.save();
    if (previousStatus !== req.body.status) {
      createAppointmentNotification(appointmentToUpdate, `appointment_${req.body.status}`).catch((error) => console.error("appointment status notification error", error));
      if (req.body.status === "completed") createAppointmentNotification(appointmentToUpdate, "review_due").catch((error) => console.error("review notification error", error));
    }
    return res.json(await appointmentQuery(Appointment.findOne({ _id: appointmentToUpdate._id, tenantId: req.tenantId })));
  } catch (error) { console.error("updateAppointmentStatus error", error); return res.status(400).json({ message: "Could not update appointment" }); }
};

export const cancelAppointment = async (req, res) => {
  if (invalidId(req.params.appointmentId)) return res.status(404).json({ message: "Appointment not found" });
  try {
    const appointment = await appointmentQuery(Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, user: req.user._id, tenantId: req.tenantId, status: { $in: ["pending", "confirmed"] } },
      { status: "cancelled" },
      { new: true, runValidators: true }
    ));
    if (!appointment) return res.status(404).json({ message: "Appointment not found or cannot be cancelled" });
    createAppointmentNotification(appointment, "appointment_cancelled").catch((error) => console.error("cancel appointment notification error", error));
    return res.json(appointment);
  } catch (error) { console.error("cancelAppointment error", error); return res.status(500).json({ message: "Server Error" }); }
};
