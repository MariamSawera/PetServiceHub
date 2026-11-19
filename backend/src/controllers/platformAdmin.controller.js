import Appointment from "../models/Appointment.js";
import Clinic from "../models/Clinic.js";
import Pet from "../models/Pet.js";
import Post from "../models/Post.js";
import Review from "../models/Review.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Profile from "../models/Profile.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import TenantMembership from "../models/TenantMembership.js";
import PlatformRole from "../models/PlatformRole.js";
import { createAuditLog } from "../services/audit.service.js";

export const getPlatformOverview = async (req, res) => {
  try {
    const [tenants, activeTenants, users, admins, providers, clinics, pets, appointments, reviews, posts] =
      await Promise.all([
        Tenant.countDocuments(),
        Tenant.countDocuments({ active: true }),
        User.countDocuments(),
        TenantMembership.countDocuments({ role: "tenant_admin", status: "active" }),
        TenantMembership.countDocuments({ role: "provider", status: "active" }),
        Clinic.countDocuments(),
        Pet.countDocuments(),
        Appointment.countDocuments(),
        Review.countDocuments(),
        Post.countDocuments(),
      ]);

    return res.json({
      stats: { tenants, activeTenants, users, admins, providers, clinics, pets, appointments, reviews, posts },
    });
  } catch (error) {
    console.error("getPlatformOverview error", error);
    return res.status(500).json({ message: "Could not load platform overview" });
  }
};

export const listPlatformTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    return res.json(tenants);
  } catch (error) {
    console.error("listPlatformTenants error", error);
    return res.status(500).json({ message: "Could not load tenants" });
  }
};

export const createPlatformTenant = async (req, res) => {
  const { name, slug, subdomain, customDomain, branding } = req.body;
  if (!name?.trim() || !slug?.trim() || !/^[a-z0-9-]+$/.test(slug.trim())) {
    return res.status(400).json({ message: "A name and lowercase slug are required" });
  }
  if (subdomain && !/^[a-z0-9-]+$/.test(subdomain)) {
    return res.status(400).json({ message: "Subdomain may contain only lowercase letters, numbers, and hyphens" });
  }
  if (customDomain && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(customDomain.toLowerCase()) ) {
    return res.status(400).json({ message: "Custom domain is invalid" });
  }
  try {
    const tenant = await Tenant.create({
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      subdomain: subdomain?.toLowerCase().trim() || undefined,
      customDomain: customDomain?.toLowerCase().trim() || undefined,
      active: true,
      branding: {
        logoUrl: branding?.logoUrl?.trim() || "",
        primaryColor: branding?.primaryColor?.trim() || "#0d9488",
        secondaryColor: branding?.secondaryColor?.trim() || "#7c3aed",
        supportEmail: branding?.supportEmail?.trim() || "",
      },
    });
    await createAuditLog(req, { action: "tenant.created", targetType: "tenant", targetId: tenant._id, tenantId: tenant._id, details: { name: tenant.name, slug: tenant.slug } });
    return res.status(201).json(tenant);
  } catch (error) {
    console.error("createPlatformTenant error", error);
    return res.status(error.code === 11000 ? 409 : 400).json({
      message: error.code === 11000 ? "Tenant slug already exists" : "Invalid tenant data",
    });
  }
};

export const updatePlatformTenant = async (req, res) => {
  try {
    const updates = {};
    if (typeof req.body.active === "boolean") updates.active = req.body.active;
    if (req.body.name?.trim()) updates.name = req.body.name.trim();
    if (req.body.subdomain !== undefined) {
      if (req.body.subdomain && !/^[a-z0-9-]+$/.test(req.body.subdomain)) {
        return res.status(400).json({ message: "Subdomain may contain only lowercase letters, numbers, and hyphens" });
      }
      updates.subdomain = req.body.subdomain.toLowerCase().trim() || undefined;
    }
    if (req.body.customDomain !== undefined) {
      if (req.body.customDomain && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(req.body.customDomain)) {
        return res.status(400).json({ message: "Custom domain is invalid" });
      }
      updates.customDomain = req.body.customDomain.toLowerCase().trim() || undefined;
    }
    if (req.body.branding) {
      updates.branding = {
        logoUrl: req.body.branding.logoUrl?.trim() || "",
        primaryColor: req.body.branding.primaryColor?.trim() || "#0d9488",
        secondaryColor: req.body.branding.secondaryColor?.trim() || "#7c3aed",
        supportEmail: req.body.branding.supportEmail?.trim() || "",
      };
    }

    const tenant = await Tenant.findByIdAndUpdate(
      req.params.tenantId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    await createAuditLog(req, { action: "tenant.updated", targetType: "tenant", targetId: tenant._id, tenantId: tenant._id, details: updates });
    return res.json(tenant);
  } catch (error) {
    console.error("updatePlatformTenant error", error);
    return res.status(500).json({ message: "Could not update tenant" });
  }
};

export const listPlatformUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -verificationToken")
      .populate("tenantId", "name slug active")
      .sort({ createdAt: -1 });
    const memberships = await TenantMembership.find()
      .populate("tenantId", "name slug active")
      .lean();
    const membershipByUser = new Map();
    for (const membership of memberships) {
      const key = String(membership.userId);
      if (!membershipByUser.has(key)) membershipByUser.set(key, []);
      membershipByUser.get(key).push(membership);
    }
    return res.json(users.map((user) => ({
      ...user.toObject(),
      memberships: membershipByUser.get(String(user._id)) || [],
    })));
  } catch (error) {
    console.error("listPlatformUsers error", error);
    return res.status(500).json({ message: "Could not load platform users" });
  }
};

export const updatePlatformUser = async (req, res) => {
  try {
    const allowedRoles = ["user", "provider", "admin", "tenant_admin", "platform_admin"];
    if (req.body.role && !allowedRoles.includes(req.body.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (String(user._id) === String(req.user._id) && req.body.role && req.body.role !== "platform_admin") {
      return res.status(400).json({ message: "You cannot remove your own platform-admin role" });
    }

    if (req.body.tenantId) {
      const tenant = await Tenant.findById(req.body.tenantId);
      if (!tenant) return res.status(400).json({ message: "Target tenant not found" });
      user.tenantId = tenant._id;
    }
    if (req.body.role) user.role = req.body.role === "tenant_admin" ? "tenant_admin" : req.body.role;
    if (typeof req.body.isVerified === "boolean") user.isVerified = req.body.isVerified;
    await user.save();

    if (req.body.tenantId || req.body.role) {
      const tenantRole = req.body.role && req.body.role !== "platform_admin"
        ? (req.body.role === "admin" ? "tenant_admin" : req.body.role)
        : null;

      if (tenantRole) {
        await TenantMembership.updateOne(
          { userId: user._id, tenantId: user.tenantId },
          {
            $set: {
              role: tenantRole,
              isVerified: typeof req.body.isVerified === "boolean" ? req.body.isVerified : user.isVerified,
              status: "active",
            },
          },
          { upsert: true }
        );
      }

      if (req.body.tenantId && !tenantRole) {
        const existingMembership = await TenantMembership.findOne({
          userId: user._id,
          tenantId: user.tenantId,
        });
        await TenantMembership.updateOne(
          { userId: user._id, tenantId: user.tenantId },
          {
            $set: {
              role: existingMembership?.role || "user",
              isVerified: typeof req.body.isVerified === "boolean" ? req.body.isVerified : user.isVerified,
              status: "active",
            },
          },
          { upsert: true }
        );
      }
    }

    if (req.body.role === "platform_admin") {
      await PlatformRole.updateOne(
        { userId: user._id, role: "platform_admin" },
        { $setOnInsert: { userId: user._id, role: "platform_admin" } },
        { upsert: true }
      );
    } else if (req.body.role) {
      await PlatformRole.deleteOne({ userId: user._id, role: "platform_admin" });
    }

    const updated = await User.findById(user._id)
      .select("-password -verificationToken")
      .populate("tenantId", "name slug active");
    await createAuditLog(req, {
      action: "user.updated",
      targetType: "user",
      targetId: user._id,
      tenantId: user.tenantId,
      details: {
        role: req.body.role,
        tenantId: req.body.tenantId,
        isVerified: req.body.isVerified,
      },
    });
    return res.json(updated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "A user with that email already exists in the target tenant" });
    }
    console.error("updatePlatformUser error", error);
    return res.status(500).json({ message: "Could not update platform user" });
  }
};

export const deletePlatformTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    if (tenant.slug === "default") {
      return res.status(400).json({ message: "The default tenant cannot be permanently deleted" });
    }

    await createAuditLog(req, {
      action: "tenant.deleted",
      targetType: "tenant",
      targetId: tenant._id,
      tenantId: tenant._id,
      details: { name: tenant.name, slug: tenant.slug },
    });

    await Promise.all([
      User.deleteMany({ tenantId: tenant._id }),
      Profile.deleteMany({ tenantId: tenant._id }),
      Pet.deleteMany({ tenantId: tenant._id }),
      Clinic.deleteMany({ tenantId: tenant._id }),
      Appointment.deleteMany({ tenantId: tenant._id }),
      Review.deleteMany({ tenantId: tenant._id }),
      Post.deleteMany({ tenantId: tenant._id }),
      Comment.deleteMany({ tenantId: tenant._id }),
      Notification.deleteMany({ tenantId: tenant._id }),
    ]);
    await tenant.deleteOne();
    return res.json({ message: "Tenant and its tenant-owned data were permanently deleted" });
  } catch (error) {
    console.error("deletePlatformTenant error", error);
    return res.status(500).json({ message: "Could not delete tenant" });
  }
};

export const listPlatformClinics = async (req, res) => {
  try {
    const filter = {};
    if (req.query.tenantId) filter.tenantId = req.query.tenantId;
    const clinics = await Clinic.find(filter)
      .populate("tenantId", "name slug")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    return res.json(clinics);
  } catch (error) {
    console.error("listPlatformClinics error", error);
    return res.status(500).json({ message: "Could not load clinics" });
  }
};

export const deletePlatformClinic = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.clinicId);
    if (!clinic) return res.status(404).json({ message: "Clinic not found" });
    await Promise.all([
      Appointment.deleteMany({ clinic: clinic._id }),
      Review.deleteMany({ clinic: clinic._id }),
    ]);
    await clinic.deleteOne();
    await createAuditLog(req, { action: "clinic.deleted", targetType: "clinic", targetId: clinic._id, tenantId: clinic.tenantId, details: { name: clinic.name } });
    return res.json({ message: "Clinic deleted across the platform" });
  } catch (error) {
    console.error("deletePlatformClinic error", error);
    return res.status(500).json({ message: "Could not delete clinic" });
  }
};

export const listPlatformPosts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.tenantId) filter.tenantId = req.query.tenantId;
    const posts = await Post.find(filter)
      .populate("tenantId", "name slug")
      .populate("author", "name email role")
      .sort({ createdAt: -1 });
    return res.json(posts);
  } catch (error) {
    console.error("listPlatformPosts error", error);
    return res.status(500).json({ message: "Could not load community posts" });
  }
};

export const deletePlatformPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    await Promise.all([
      Comment.deleteMany({ post: post._id }),
      post.deleteOne(),
    ]);
    await createAuditLog(req, { action: "post.deleted", targetType: "post", targetId: post._id, tenantId: post.tenantId, details: { title: post.title } });
    return res.json({ message: "Community post deleted across the platform" });
  } catch (error) {
    console.error("deletePlatformPost error", error);
    return res.status(500).json({ message: "Could not delete community post" });
  }
};

export const listPlatformAuditLogs = async (req, res) => {
  try {
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.tenantId) filter.tenantId = req.query.tenantId;
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(500);
    return res.json(logs);
  } catch (error) {
    console.error("listPlatformAuditLogs error", error);
    return res.status(500).json({ message: "Could not load audit logs" });
  }
};

export const updatePlatformAccountStatus = async (req, res) => {
  try {
    if (typeof req.body.suspended !== "boolean") {
      return res.status(400).json({ message: "Suspended status is required" });
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (String(user._id) === String(req.user._id) && req.body.suspended) {
      return res.status(400).json({ message: "You cannot suspend your own account" });
    }
    user.suspended = req.body.suspended;
    await user.save();
    await createAuditLog(req, {
      action: req.body.suspended ? "account.suspended" : "account.reactivated",
      targetType: "user",
      targetId: user._id,
      tenantId: user.tenantId,
      details: { suspended: req.body.suspended },
    });
    const updated = await User.findById(user._id)
      .select("-password -verificationToken")
      .populate("tenantId", "name slug active");
    return res.json(updated);
  } catch (error) {
    console.error("updatePlatformAccountStatus error", error);
    return res.status(500).json({ message: "Could not update account status" });
  }
};

export const listPlatformMemberships = async (req, res) => {
  try {
    const filter = {};
    if (req.query.tenantId) filter.tenantId = req.query.tenantId;
    if (req.query.userId) filter.userId = req.query.userId;
    const memberships = await TenantMembership.find(filter)
      .populate("userId", "name email suspended")
      .populate("tenantId", "name slug active")
      .sort({ createdAt: -1 });
    return res.json(memberships);
  } catch (error) {
    console.error("listPlatformMemberships error", error);
    return res.status(500).json({ message: "Could not load memberships" });
  }
};

export const updatePlatformMembershipStatus = async (req, res) => {
  try {
    const allowedStatuses = ["active", "suspended", "revoked"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid membership status" });
    }
    const membership = await TenantMembership.findById(req.params.membershipId);
    if (!membership) return res.status(404).json({ message: "Membership not found" });
    if (String(membership.userId) === String(req.user._id) && req.body.status !== "active") {
      return res.status(400).json({ message: "You cannot suspend or revoke your own membership" });
    }
    if (membership.role === "tenant_admin" && req.body.status !== "active") {
      const activeTenantAdminCount = await TenantMembership.countDocuments({
        tenantId: membership.tenantId,
        role: "tenant_admin",
        status: "active",
      });
      if (activeTenantAdminCount <= 1) {
        return res.status(400).json({ message: "Cannot suspend or revoke the last active tenant admin" });
      }
    }
    membership.status = req.body.status;
    await membership.save();
    await createAuditLog(req, {
      action: `membership.${req.body.status}`,
      targetType: "tenant_membership",
      targetId: membership._id,
      tenantId: membership.tenantId,
      details: { status: req.body.status, role: membership.role, userId: membership.userId },
    });
    const updated = await TenantMembership.findById(membership._id)
      .populate("userId", "name email suspended")
      .populate("tenantId", "name slug active");
    return res.json(updated);
  } catch (error) {
    console.error("updatePlatformMembershipStatus error", error);
    return res.status(500).json({ message: "Could not update membership status" });
  }
};
