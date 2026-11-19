import Appointment from "../models/Appointment.js";
import Clinic from "../models/Clinic.js";
import Comment from "../models/Comment.js";
import Pet from "../models/Pet.js";
import Post from "../models/Post.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { createAuditLog } from "../services/audit.service.js";
import TenantMembership from "../models/TenantMembership.js";
import AuditLog from "../models/AuditLog.js";

export const getAdminOverview = async (req, res) => {
  try {
    const tenant = { tenantId: req.tenantId };
    const [
      users,
      providers,
      clinics,
      pets,
      appointments,
      pendingAppointments,
      reviews,
      posts,
    ] = await Promise.all([
      TenantMembership.countDocuments({ tenantId: req.tenantId, status: "active" }),
      TenantMembership.countDocuments({ tenantId: req.tenantId, role: "provider", status: "active" }),
      Clinic.countDocuments(tenant),
      Pet.countDocuments(tenant),
      Appointment.countDocuments(tenant),
      Appointment.countDocuments({ ...tenant, status: "pending" }),
      Review.countDocuments(tenant),
      Post.countDocuments(tenant),
    ]);

    const recentAppointments = await Appointment.find(tenant)
      .populate("user", "name email")
      .populate("pet", "name")
      .populate("clinic", "name")
      .sort({ createdAt: -1 })
      .limit(8);

    return res.json({
      stats: { users, providers, clinics, pets, appointments, pendingAppointments, reviews, posts },
      recentAppointments,
    });
  } catch (error) {
    console.error("getAdminOverview error", error);
    return res.status(500).json({ message: "Could not load admin overview" });
  }
};

export const listAdminUsers = async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.tenantId })
      .select("-password -verificationToken")
      .sort({ createdAt: -1 });
    const memberships = await TenantMembership.find({ tenantId: req.tenantId }).lean();
    const membershipsByUser = new Map(
      memberships.map((membership) => [String(membership.userId), membership])
    );
    return res.json(users.map((user) => ({
      ...user.toObject(),
      membership: membershipsByUser.get(String(user._id)) || null,
    })));
  } catch (error) {
    console.error("listAdminUsers error", error);
    return res.status(500).json({ message: "Could not load users" });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    const { role, isVerified, membershipStatus } = req.body;
    if (role && !["user", "provider", "tenant_admin", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (membershipStatus && !["active", "suspended", "revoked"].includes(membershipStatus)) {
      return res.status(400).json({ message: "Invalid membership status" });
    }
    if (String(req.params.userId) === String(req.user._id) && role && role !== "tenant_admin" && role !== "admin") {
      return res.status(400).json({ message: "You cannot remove your own admin role" });
    }
    if (String(req.params.userId) === String(req.user._id) && role) {
      return res.status(400).json({ message: "You cannot modify your own tenant membership role" });
    }

    if ((role && role !== "tenant_admin" && role !== "admin") || membershipStatus === "suspended" || membershipStatus === "revoked") {
      const targetMembership = await TenantMembership.findOne({
        userId: req.params.userId,
        tenantId: req.tenantId,
        role: "tenant_admin",
      });
      if (targetMembership) {
        const activeTenantAdminCount = await TenantMembership.countDocuments({
          tenantId: req.tenantId,
          role: "tenant_admin",
          status: "active",
        });
        if (activeTenantAdminCount <= 1) {
          return res.status(400).json({ message: "Cannot remove the last active tenant admin" });
        }
      }
    }

    const updates = {};
    if (role) updates.role = role === "tenant_admin" ? "tenant_admin" : role;
    if (typeof isVerified === "boolean") updates.isVerified = isVerified;

    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, tenantId: req.tenantId },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -verificationToken");

    if (!user) return res.status(404).json({ message: "User not found" });
    if (role || typeof isVerified === "boolean" || membershipStatus) {
      await TenantMembership.updateOne(
        { userId: user._id, tenantId: req.tenantId },
        {
          $set: {
            ...(role ? { role: role === "admin" ? "tenant_admin" : role } : {}),
            isVerified: typeof isVerified === "boolean" ? isVerified : user.isVerified,
            ...(membershipStatus ? { status: membershipStatus } : {}),
          },
        },
        { upsert: true }
      );
    }
    const membership = await TenantMembership.findOne({ userId: user._id, tenantId: req.tenantId }).lean();
    await createAuditLog(req, { action: "tenant-user.updated", targetType: "user", targetId: user._id, tenantId: req.tenantId, details: updates });
    return res.json({ ...user.toObject(), membership });
  } catch (error) {
    console.error("updateAdminUser error", error);
    return res.status(500).json({ message: "Could not update user" });
  }
};

export const listAdminClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find({ tenantId: req.tenantId })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    return res.json(clinics);
  } catch (error) {
    console.error("listAdminClinics error", error);
    return res.status(500).json({ message: "Could not load clinics" });
  }
};

export const deleteAdminClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ _id: req.params.clinicId, tenantId: req.tenantId });
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });

    await Promise.all([
      Appointment.deleteMany({ clinic: clinic._id, tenantId: req.tenantId }),
      Review.deleteMany({ clinic: clinic._id, tenantId: req.tenantId }),
    ]);
    await clinic.deleteOne();
    await createAuditLog(req, { action: "tenant-clinic.deleted", targetType: "clinic", targetId: clinic._id, tenantId: req.tenantId, details: { name: clinic.name } });
    return res.json({ message: "Clinic deleted" });
  } catch (error) {
    console.error("deleteAdminClinic error", error);
    return res.status(500).json({ message: "Could not delete clinic" });
  }
};

export const listAdminAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ tenantId: req.tenantId })
      .populate("user", "name email")
      .populate("pet", "name")
      .populate("clinic", "name")
      .sort({ date: -1, createdAt: -1 });
    return res.json(appointments);
  } catch (error) {
    console.error("listAdminAppointments error", error);
    return res.status(500).json({ message: "Could not load appointments" });
  }
};

export const updateAdminAppointment = async (req, res) => {
  try {
    if (!["pending", "confirmed", "completed", "cancelled"].includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid appointment status" });
    }
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.appointmentId, tenantId: req.tenantId },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    )
      .populate("user", "name email")
      .populate("pet", "name")
      .populate("clinic", "name");
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    await createAuditLog(req, { action: "tenant-appointment.updated", targetType: "appointment", targetId: appointment._id, tenantId: req.tenantId, details: { status: req.body.status } });
    return res.json(appointment);
  } catch (error) {
    console.error("updateAdminAppointment error", error);
    return res.status(500).json({ message: "Could not update appointment" });
  }
};

export const listAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tenantId: req.tenantId })
      .populate("user", "name email")
      .populate("clinic", "name")
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (error) {
    console.error("listAdminReviews error", error);
    return res.status(500).json({ message: "Could not load reviews" });
  }
};

export const deleteAdminReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.reviewId, tenantId: req.tenantId });
    if (!review) return res.status(404).json({ message: "Review not found" });

    const summary = await Review.aggregate([
      { $match: { clinic: review.clinic, tenantId: req.tenantId } },
      { $group: { _id: "$clinic", rating: { $avg: "$rating" }, reviews: { $sum: 1 } } },
    ]);
    await Clinic.findOneAndUpdate(
      { _id: review.clinic, tenantId: req.tenantId },
      { $set: { rating: summary[0] ? Number(summary[0].rating.toFixed(1)) : 0, reviews: summary[0]?.reviews || 0 } }
    );
    await createAuditLog(req, { action: "tenant-review.deleted", targetType: "review", targetId: review._id, tenantId: req.tenantId, details: { clinic: String(review.clinic) } });
    return res.json({ message: "Review deleted" });
  } catch (error) {
    console.error("deleteAdminReview error", error);
    return res.status(500).json({ message: "Could not delete review" });
  }
};

export const listAdminPosts = async (req, res) => {
  try {
    const posts = await Post.find({ tenantId: req.tenantId })
      .populate("author", "name email role")
      .sort({ createdAt: -1 });
    return res.json(posts);
  } catch (error) {
    console.error("listAdminPosts error", error);
    return res.status(500).json({ message: "Could not load posts" });
  }
};

export const deleteAdminPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId, tenantId: req.tenantId });
    if (!post) return res.status(404).json({ message: "Post not found" });
    await Promise.all([
      Comment.deleteMany({ post: post._id, tenantId: req.tenantId }),
      post.deleteOne(),
    ]);
    await createAuditLog(req, { action: "tenant-post.deleted", targetType: "post", targetId: post._id, tenantId: req.tenantId, details: { title: post.title } });
    return res.json({ message: "Post deleted" });
  } catch (error) {
    console.error("deleteAdminPost error", error);
    return res.status(500).json({ message: "Could not delete post" });
  }
};

export const listTenantAuditLogs = async (req, res) => {
  try {
    const filter = { tenantId: req.tenantId };
    if (req.query.action) filter.action = req.query.action;
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(500);
    return res.json(logs);
  } catch (error) {
    console.error("listTenantAuditLogs error", error);
    return res.status(500).json({ message: "Could not load tenant audit logs" });
  }
};
