import Pet from "../models/Pet.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfTodayUtc = () => {
  const today = new Date();
  return Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
};

const reminderStatus = (daysUntilDue) => {
  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue === 0) return "dueToday";
  return "dueSoon";
};

export const listReminders = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id, tenantId: req.tenantId }).select("name species vaccinations");
    const today = startOfTodayUtc();
    const reminders = pets.flatMap((pet) => pet.vaccinations
      .filter((vaccination) => vaccination.nextDueDate)
      .map((vaccination) => {
        const dueDate = new Date(vaccination.nextDueDate);
        const daysUntilDue = Math.round((Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate()) - today) / MS_PER_DAY);

        return {
          vaccinationId: vaccination._id,
          pet: {
            _id: pet._id,
            name: pet.name,
            species: pet.species,
          },
          vaccineName: vaccination.vaccineName,
          nextDueDate: vaccination.nextDueDate,
          daysUntilDue,
          status: reminderStatus(daysUntilDue),
        };
      })
      .filter((reminder) => reminder.daysUntilDue <= 30));

    reminders.sort((first, second) => first.daysUntilDue - second.daysUntilDue);
    return res.json(reminders);
  } catch (error) {
    console.error("listReminders error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};