import mongoose from "mongoose";
import Notification from "../models/Notification.js";

const invalidId = (id) => !mongoose.isValidObjectId(id);

export const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, readAt: null });
    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("listNotifications error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const markNotificationRead = async (req, res) => {
  if (invalidId(req.params.notificationId)) return res.status(404).json({ message: "Notification not found" });
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.user._id },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.json(notification);
  } catch (error) {
    console.error("markNotificationRead error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, readAt: null }, { readAt: new Date() });
    return res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("markAllNotificationsRead error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
