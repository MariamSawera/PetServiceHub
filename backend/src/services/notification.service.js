import Notification from "../models/Notification.js";
import Clinic from "../models/Clinic.js";
import Pet from "../models/Pet.js";
import User from "../models/User.js";
import sendNotificationEmail from "../utils/sendNotificationEmail.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const reminderWindowDays = () => Math.min(Math.max(Number(process.env.VACCINATION_REMINDER_DAYS || 30), 1), 365);

const dateKey = (date) => new Date(date).toISOString().slice(0, 10);

const nextRecurringDate = (date, recurrenceMonths, today) => {
  const nextDate = new Date(date);
  while (nextDate <= today) nextDate.setMonth(nextDate.getMonth() + recurrenceMonths);
  return nextDate;
};

export const createNotification = async ({ tenantId, recipient, type, title, message, link, referenceId, uniqueKey }) => {
  if (!tenantId || !recipient || !uniqueKey) return null;

  try {
    const notification = await Notification.create({ tenantId, recipient: recipient._id || recipient, type, title, message, link, referenceId, uniqueKey });
    const user = await User.findById(notification.recipient).select("email name");
    await sendNotificationEmail({ email: user?.email, name: user?.name, title, message }).catch((error) => console.error("notification email error", error));
    return notification;
  } catch (error) {
    if (error.code === 11000) return Notification.findOne({ tenantId, uniqueKey });
    throw error;
  }
};

export const createAppointmentNotification = async (appointment, type, audience = "user") => {
  const petName = appointment.pet?.name || "your pet";
  const service = appointment.service;
  const clinic = appointment.clinic?.owner
    ? appointment.clinic
    : await Clinic.findOne({ _id: appointment.clinic, tenantId: appointment.tenantId }).select("owner name");
  const recipient = audience === "provider" ? clinic?.owner : appointment.user;
  const messages = {
    appointment_created: {
      title: "New appointment request",
      message: `A new ${service} appointment for ${petName} is waiting for your confirmation.`,
      link: "/provider/appointments",
    },
    appointment_confirmed: {
      title: "Appointment confirmed",
      message: `Your ${service} appointment for ${petName} has been confirmed.`,
      link: "/appointments",
    },
    appointment_cancelled: audience === "provider"
      ? {
          title: "Appointment cancelled",
          message: `The ${service} appointment for ${petName} was cancelled by the user.`,
          link: "/provider/appointments",
        }
      : {
          title: "Appointment cancelled",
          message: `Your ${service} appointment for ${petName} was cancelled.`,
          link: "/appointments",
        },
    appointment_completed: {
      title: "Appointment completed",
      message: `${service} for ${petName} is complete.`,
      link: "/appointments",
    },
    review_due: {
      title: "Leave a review",
      message: `How was your ${service} appointment for ${petName}?`,
      link: "/appointments",
    },
  };
  const notification = messages[type];
  if (!notification) return null;
  if (!recipient) return null;

  return createNotification({
    tenantId: appointment.tenantId,
    recipient,
    type,
    ...notification,
    referenceId: appointment._id,
    uniqueKey: `${type}:${appointment._id}:${audience}`,
  });
};

export const createReviewNotification = async (review, type = "review_created") => {
  const clinic = await Clinic.findOne({ _id: review.clinic, tenantId: review.tenantId }).select("owner name");
  if (!clinic?.owner) return null;

  return createNotification({
    tenantId: review.tenantId,
    recipient: clinic.owner,
    type,
    title: type === "review_updated" ? "Clinic review updated" : "New clinic review",
    message: `Your clinic received a ${review.rating}-star review${type === "review_updated" ? " update" : ""}.`,
    link: "/provider/clinics",
    referenceId: review._id,
    uniqueKey: `${type}:${review._id}`,
  });
};

export const createVaccinationNotifications = async (now = new Date()) => {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const cutoff = new Date(today + reminderWindowDays() * MS_PER_DAY);
  const pets = await Pet.find({ "vaccinations.nextDueDate": { $exists: true, $ne: null, $lte: cutoff } }).select("owner name vaccinations tenantId");
  const notifications = [];
  const recurringUpdates = [];

  for (const pet of pets) {
    for (const vaccination of pet.vaccinations) {
      if (!vaccination.nextDueDate || new Date(vaccination.nextDueDate) > cutoff) continue;
      const dueDate = dateKey(vaccination.nextDueDate);
      notifications.push(createNotification({
        tenantId: pet.tenantId,
        recipient: pet.owner,
        type: "vaccination_due",
        title: "Vaccination reminder",
        message: `${pet.name}'s ${vaccination.vaccineName} vaccination is due on ${new Date(vaccination.nextDueDate).toLocaleDateString()}.`,
        link: `/pets/${pet._id}`,
        referenceId: vaccination._id,
        uniqueKey: `vaccination_due:${vaccination._id}:${dueDate}`,
      }));

      if (vaccination.recurrenceMonths && new Date(vaccination.nextDueDate) < new Date(today)) {
        recurringUpdates.push(Pet.updateOne(
          { _id: pet._id, "vaccinations._id": vaccination._id },
          { $set: { "vaccinations.$.nextDueDate": nextRecurringDate(vaccination.nextDueDate, vaccination.recurrenceMonths, new Date(today)) } }
        ));
      }
    }
  }

  await Promise.all([...notifications, ...recurringUpdates]);
  return notifications.length;
};
