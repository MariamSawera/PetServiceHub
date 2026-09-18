import Notification from "../models/Notification.js";
import Pet from "../models/Pet.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dateKey = (date) => new Date(date).toISOString().slice(0, 10);

export const createNotification = async ({ tenantId, recipient, type, title, message, link, referenceId, uniqueKey }) => {
  if (!tenantId || !recipient || !uniqueKey) return null;

  try {
    return await Notification.create({ tenantId, recipient: recipient._id || recipient, type, title, message, link, referenceId, uniqueKey });
  } catch (error) {
    if (error.code === 11000) return Notification.findOne({ tenantId, uniqueKey });
    throw error;
  }
};

export const createAppointmentNotification = (appointment, type) => {
  const petName = appointment.pet?.name || "your pet";
  const service = appointment.service;
  const messages = {
    appointment_created: {
      title: "Appointment created",
      message: `${service} for ${petName} is waiting for clinic confirmation.`,
      link: `/appointments/${appointment._id}/confirmation`,
    },
    appointment_confirmed: {
      title: "Appointment confirmed",
      message: `Your ${service} appointment for ${petName} has been confirmed.`,
      link: "/appointments",
    },
    appointment_cancelled: {
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

  return createNotification({
    tenantId: appointment.tenantId,
    recipient: appointment.user,
    type,
    ...notification,
    referenceId: appointment._id,
    uniqueKey: `${type}:${appointment._id}`,
  });
};

export const createVaccinationNotifications = async (now = new Date()) => {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const cutoff = new Date(today + 30 * MS_PER_DAY);
  const pets = await Pet.find({ "vaccinations.nextDueDate": { $exists: true, $ne: null, $lte: cutoff } }).select("owner name vaccinations tenantId");
  const notifications = [];

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
    }
  }

  await Promise.all(notifications);
  return notifications.length;
};
