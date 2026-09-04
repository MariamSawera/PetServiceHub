import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic", required: true, index: true },
    service: { type: String, required: true, trim: true, maxlength: 120 },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true, maxlength: 20 },
    notes: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

appointmentSchema.index({ user: 1, date: 1 });
appointmentSchema.index({ clinic: 1, date: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;