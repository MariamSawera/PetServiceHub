import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Clinic from "../models/Clinic.js";
import Review from "../models/Review.js";

const invalidId = (id) => !mongoose.isValidObjectId(id);

const reviewQuery = (query) => query.populate("user", "name").populate("clinic", "name city").populate("appointment", "pet service date").sort({ createdAt: -1 });

const refreshClinicRating = async (clinicId) => {
  const [summary] = await Review.aggregate([
    { $match: { clinic: new mongoose.Types.ObjectId(clinicId) } },
    { $group: { _id: "$clinic", rating: { $avg: "$rating" }, reviews: { $sum: 1 } } },
  ]);
  await Clinic.findByIdAndUpdate(clinicId, { rating: summary?.rating ? Number(summary.rating.toFixed(1)) : 0, reviews: summary?.reviews || 0 });
};

export const listClinicReviews = async (req, res) => {
  if (invalidId(req.params.clinicId)) return res.status(404).json({ message: "Clinic not found" });
  try { return res.json(await reviewQuery(Review.find({ clinic: req.params.clinicId }))); }
  catch (error) { console.error("listClinicReviews error", error); return res.status(500).json({ message: "Server Error" }); }
};

export const listUserReviews = async (req, res) => {
  try { return res.json(await reviewQuery(Review.find({ user: req.user._id }))); }
  catch (error) { console.error("listUserReviews error", error); return res.status(500).json({ message: "Server Error" }); }
};

export const createReview = async (req, res) => {
  const { appointment, rating, comment } = req.body;
  if (!appointment || invalidId(appointment) || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    return res.status(400).json({ message: "A completed appointment and rating from 1 to 5 are required" });
  }
  try {
    const completedAppointment = await Appointment.findOne({ _id: appointment, user: req.user._id, status: "completed" });
    if (!completedAppointment) return res.status(400).json({ message: "Reviews are available after a completed appointment" });
    const existingReview = await Review.findOne({ appointment });
    if (existingReview) return res.status(409).json({ message: "You have already reviewed this appointment" });
    const review = await Review.create({ user: req.user._id, appointment, clinic: completedAppointment.clinic, rating: Number(rating), comment });
    await refreshClinicRating(completedAppointment.clinic);
    return res.status(201).json(await reviewQuery(Review.findById(review._id)));
  } catch (error) {
    console.error("createReview error", error);
    return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "You have already reviewed this appointment" : "Invalid review data" });
  }
};

export const updateReview = async (req, res) => {
  if (invalidId(req.params.reviewId)) return res.status(404).json({ message: "Review not found" });
  try {
    const review = await Review.findOneAndUpdate({ _id: req.params.reviewId, user: req.user._id }, { rating: req.body.rating, comment: req.body.comment }, { new: true, runValidators: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    await refreshClinicRating(review.clinic);
    return res.json(await reviewQuery(Review.findById(review._id)));
  } catch (error) { console.error("updateReview error", error); return res.status(400).json({ message: "Invalid review data" }); }
};

export const deleteReview = async (req, res) => {
  if (invalidId(req.params.reviewId)) return res.status(404).json({ message: "Review not found" });
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.reviewId, user: req.user._id });
    if (!review) return res.status(404).json({ message: "Review not found" });
    await refreshClinicRating(review.clinic);
    return res.json({ message: "Review deleted successfully" });
  } catch (error) { console.error("deleteReview error", error); return res.status(500).json({ message: "Server Error" }); }
};