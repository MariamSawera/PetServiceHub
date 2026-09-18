import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["appointment_created", "appointment_confirmed", "appointment_cancelled", "appointment_completed", "review_due", "vaccination_due"],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    link: { type: String, trim: true, maxlength: 300 },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    uniqueKey: { type: String, required: true, unique: true, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
