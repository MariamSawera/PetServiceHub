import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { requireTenantMembership } from "../middleware/requireTenantMembership.js";
import { createReview, deleteReview, listClinicReviews, listUserReviews, updateReview } from "../controllers/review.controller.js";

const router = express.Router();

router.get("/clinic/:clinicId", listClinicReviews);
router.use(protectRoute, requireTenantMembership);
router.get("/mine", listUserReviews);
router.post("/", createReview);
router.patch("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);

export default router;