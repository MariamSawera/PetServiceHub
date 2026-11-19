import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import TenantMembership from "../models/TenantMembership.js";
import PlatformRole from "../models/PlatformRole.js";
import Profile from "../models/Profile.js";
import Pet from "../models/Pet.js";
import Clinic from "../models/Clinic.js";
import Appointment from "../models/Appointment.js";
import Review from "../models/Review.js";
import Post from "../models/Post.js";

const roleMap = {
  user: "user",
  provider: "provider",
  admin: "tenant_admin",
  tenant_admin: "tenant_admin",
  platform_admin: "platform_admin",
};

const countBy = (values) => values.reduce((result, value) => {
  result[value] = (result[value] || 0) + 1;
  return result;
}, {});

try {
  await connectDB();

  const users = await User.find().select("name email tenantId role isVerified suspended googleId authProvider password").lean();
  const tenantIds = [...new Set(users.map((user) => String(user.tenantId)).filter(Boolean))];
  const tenants = await Tenant.find({ _id: { $in: tenantIds } }).lean();
  const tenantNames = new Map(tenants.map((tenant) => [String(tenant._id), tenant.slug]));

  const duplicateGroups = new Map();
  for (const user of users) {
    const email = String(user.email || "").toLowerCase();
    if (!email) continue;
    if (!duplicateGroups.has(email)) duplicateGroups.set(email, []);
    duplicateGroups.get(email).push(user);
  }

  const duplicateAccounts = [];
  const conflicts = [];
  for (const [email, accounts] of duplicateGroups.entries()) {
    if (accounts.length < 2) continue;

    duplicateAccounts.push({
      email,
      count: accounts.length,
      requiresManualResolution: true,
      accounts: accounts.map((account) => ({
        userId: account._id,
        tenantId: account.tenantId,
        tenantSlug: tenantNames.get(String(account.tenantId)) || null,
        role: account.role,
        isVerified: account.isVerified,
        authProvider: account.authProvider,
        googleLinked: Boolean(account.googleId),
        hasPassword: Boolean(account.password),
      })),
    });

    conflicts.push({
      email,
      reason: "duplicate email accounts exist across tenants",
      requiresManualResolution: true,
    });

    const passwordStates = new Set(accounts.map((account) => Boolean(account.password)));
    const googleStates = new Set(accounts.map((account) => Boolean(account.googleId)));
    const verificationStates = new Set(accounts.map((account) => Boolean(account.isVerified)));
    const suspensionStates = new Set(accounts.map((account) => Boolean(account.suspended)));

    if (
      passwordStates.size > 1 ||
      googleStates.size > 1 ||
      verificationStates.size > 1 ||
      suspensionStates.size > 1
    ) {
      conflicts.push({
        email,
        reason: "duplicate accounts have conflicting authentication, verification, or suspension state",
        requiresManualResolution: true,
      });
    }
  }

  const [
    existingMembershipCount,
    existingPlatformRoleCount,
    profileCount,
    petCount,
    clinicCount,
    appointmentCount,
    reviewCount,
    postCount,
  ] = await Promise.all([
    TenantMembership.countDocuments(),
    PlatformRole.countDocuments(),
    Profile.countDocuments(),
    Pet.countDocuments(),
    Clinic.countDocuments(),
    Appointment.countDocuments(),
    Review.countDocuments(),
    Post.countDocuments(),
  ]);

  const expectedMemberships = users.map((user) => {
    const legacyRole = user.role || "user";
    return {
      userId: user._id,
      tenantId: user.tenantId,
      legacyRole,
      mappedRole: roleMap[legacyRole] || "user",
      isVerified: Boolean(user.isVerified),
    };
  });

  const tenantMembershipCandidates = expectedMemberships.filter((membership) =>
    membership.mappedRole !== "platform_admin"
  );
  const platformAdminCandidates = expectedMemberships.filter((membership) =>
    membership.legacyRole === "platform_admin"
  );

  const report = {
    generatedAt: new Date().toISOString(),
    mode: "read-only",
    summary: {
      totalUsers: users.length,
      totalTenants: await Tenant.countDocuments(),
      tenantMembershipCandidates: tenantMembershipCandidates.length,
      platformAdminCandidates: platformAdminCandidates.length,
      existingMembershipCount,
      existingPlatformRoleCount,
      duplicateEmailCount: duplicateAccounts.length,
      conflictCount: conflicts.length,
      associatedRecords: {
        profiles: profileCount,
        pets: petCount,
        clinics: clinicCount,
        appointments: appointmentCount,
        reviews: reviewCount,
        posts: postCount,
      },
    },
    roleMapping: countBy(expectedMemberships.map((membership) => membership.legacyRole)),
    duplicateAccounts,
    conflicts,
    usersMissingTenant: users.filter((user) => !user.tenantId).map((user) => ({
      userId: user._id,
      email: user.email,
    })),
  };

  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error("Migration report failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
