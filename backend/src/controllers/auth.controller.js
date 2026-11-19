import mongoose from "mongoose";
import Tenant from "../models/Tenant.js"; 
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendVerificationEmail from "../utils/sendEmail.js";
import passport from "../config/passport.js";  
import TenantMembership from "../models/TenantMembership.js";
import PlatformRole from "../models/PlatformRole.js";
import { createAuditLog } from "../services/audit.service.js";

const authUserResponse = async (user) => {
  const tenant = await Tenant.findById(user.tenantId).select("name slug subdomain customDomain branding active");
  const memberships = await TenantMembership.find({ userId: user._id, status: "active" })
    .populate("tenantId", "name slug subdomain customDomain branding active")
    .sort({ createdAt: 1 });
  const platformRole = await PlatformRole.findOne({ userId: user._id, role: "platform_admin" });
  const activeMembership = memberships.find((membership) =>
    String(membership.tenantId?._id || membership.tenantId) === String(user.tenantId)
  );
  const tenantRole = activeMembership?.role
    || (user.role === "admin" ? "tenant_admin" : user.role);

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: tenantRole,
    tenantRole,
    isPlatformAdmin: Boolean(platformRole),
    memberships: memberships.map((membership) => ({
      tenant: membership.tenantId,
      role: membership.role,
      status: membership.status,
      isVerified: membership.isVerified,
    })),
    tenant: tenant ? { _id: tenant._id, name: tenant.name, slug: tenant.slug, subdomain: tenant.subdomain, customDomain: tenant.customDomain, branding: tenant.branding, active: tenant.active } : null,
  };
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email, tenantId: req.tenantId });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");

const user = await User.create({
  name,
  email,
  password: hashedPassword,
  tenantId: req.tenantId,

  isVerified: false,

  verificationToken,
  verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,

  authProvider: "local",
});

await TenantMembership.updateOne(
  { userId: user._id, tenantId: req.tenantId },
  { $setOnInsert: { userId: user._id, tenantId: req.tenantId, role: "user", isVerified: false, status: "active" } },
  { upsert: true }
);

await sendVerificationEmail(email, verificationToken);

    // generateToken(user, res);

return res.status(201).json({
  message: "Registration successful. Please verify your email.",
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    await TenantMembership.updateOne(
      { userId: user._id, tenantId: req.tenantId },
      { $set: { isVerified: true } }
    );

    return res.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, tenantId: req.tenantId }) || await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.suspended) {
      return res.status(403).json({ message: "Account is suspended" });
    }

    const membership = await TenantMembership.findOne({ userId: user._id, tenantId: req.tenantId });
    if (!membership || membership.status !== "active") {
      return res.status(403).json({ message: "No active tenant membership" });
    }
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant || !tenant.active) {
      return res.status(403).json({ message: "Tenant is inactive" });
    }

    if (!user.password) {
      return res.status(401).json({ message: "This account uses Google login. Please continue with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!membership.isVerified || !user.isVerified) {
  return res.status(403).json({
    message: "Please verify your email before logging in",
  });
}

    generateToken(user, res);
    return res.json(await authUserResponse(user));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const switchTenant = async (req, res) => {
  try {
    if (req.user.suspended) {
      return res.status(403).json({ message: "Account is suspended" });
    }

    const identifier = String(req.body.tenantId || req.body.tenantSlug || "").trim();
    if (!identifier) {
      return res.status(400).json({ message: "Tenant identifier is required" });
    }

    const tenant = await Tenant.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(identifier) ? identifier : undefined },
        { slug: identifier.toLowerCase() },
        { subdomain: identifier.toLowerCase() },
        { customDomain: identifier.toLowerCase() },
      ].filter((condition) => Object.values(condition)[0] !== undefined),
      deletedAt: null,
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const membership = await TenantMembership.findOne({
      userId: req.user._id,
      tenantId: tenant._id,
    });

    if (!req.isPlatformAdmin) {
      if (!tenant.active) {
        return res.status(403).json({ message: "Tenant is inactive" });
      }
      if (!membership || membership.status !== "active") {
        return res.status(403).json({ message: "No active membership for this tenant" });
      }
    } else if (membership && membership.status !== "active") {
      return res.status(403).json({ message: "Tenant membership is not active" });
    }

    req.user.tenantId = tenant._id;
    req.user.role = membership?.role || req.user.role;
    await req.user.save();
    generateToken(req.user, res);

    await createAuditLog(req, {
      action: "tenant.switched",
      targetType: "tenant",
      targetId: tenant._id,
      tenantId: tenant._id,
      details: {
        tenantSlug: tenant.slug,
        tenantRole: membership?.role || null,
      },
    });

    return res.json(await authUserResponse(req.user));
  } catch (error) {
    console.error("switchTenant error", error);
    return res.status(500).json({ message: "Could not switch tenant" });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  return res.json({ message: "Logged out successfully" });
};

export const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  return res.json(await authUserResponse(req.user));
};

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});


// export const googleCallback = (req, res, next) => {
//   passport.authenticate(
//     "google",
//     { session: false },
//     (err, user) => {
//       if (err) {
//         console.error("Google authentication error:", err);

//         return res.status(500).json({
//           message: "Google authentication failed",
//         });
//       }

//       if (!user) {
//         return res.status(401).json({
//           message: "Google authentication failed",
//         });
//       }

//       // Generate your normal JWT cookie
//       generateToken(user, res);

//       // Redirect to your React frontend
//       return res.redirect("http://localhost:5173");
//     }
//   )(req, res, next);
// };    //with frontend

export const googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    (err, user) => {
      if (err) {
        console.error("Google authentication error:", err);
        return res.redirect("http://localhost:5173/login?error=google_failed");
      }

      if (!user) {
        return res.redirect("http://localhost:5173/login?error=google_failed");
      }

      generateToken(user, res);
      return res.redirect("http://localhost:5173");
    }
  )(req, res, next);
};