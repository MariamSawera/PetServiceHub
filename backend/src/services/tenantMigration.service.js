import Appointment from "../models/Appointment.js";
import Clinic from "../models/Clinic.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";
import Pet from "../models/Pet.js";
import Post from "../models/Post.js";
import Profile from "../models/Profile.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

export const migrateLegacyRecords = async (tenantId) => {
  const models = [User, Clinic, Pet, Appointment, Profile, Review, Notification, Post, Comment];
  await Promise.all(models.map((Model) => Model.updateMany({ tenantId: { $exists: false } }, { $set: { tenantId } })));
  for (const index of ["email_1"]) {
    try { await User.collection.dropIndex(index); } catch (error) { if (error.code !== 27) throw error; }
  }
  for (const index of ["userId_1"]) {
    try { await Profile.collection.dropIndex(index); } catch (error) { if (error.code !== 27) throw error; }
  }
  try { await Review.collection.dropIndex("appointment_1"); } catch (error) { if (error.code !== 27) throw error; }
  try { await Notification.collection.dropIndex("uniqueKey_1"); } catch (error) { if (error.code !== 27) throw error; }
  await User.syncIndexes();
  await Notification.syncIndexes();
  await Profile.syncIndexes();
  await Review.syncIndexes();
};