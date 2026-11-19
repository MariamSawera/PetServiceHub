import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import TenantMembership from "../models/TenantMembership.js";
import PlatformRole from "../models/PlatformRole.js";

const mode = process.argv.includes("--execute") ? "execute" : "dry-run";

const roleMap = {
  user: "user",
  provider: "provider",
  admin: "tenant_admin",
  tenant_admin: "tenant_admin",
};

try {
  await connectDB();

  const users = await User.find().select("_id tenantId role isVerified suspended").lean();
  const membershipsToCreate = [];
  const platformRolesToCreate = [];
  const skippedUsers = [];
  const duplicateEmails = new Map();

  const allUsers = await User.find().select("_id email tenantId role isVerified").lean();
  for (const user of allUsers) {
    const email = String(user.email || "").toLowerCase();
    if (!email) continue;
    if (!duplicateEmails.has(email)) duplicateEmails.set(email, []);
    duplicateEmails.get(email).push(user);
  }

  for (const user of users) {
    if (!user.tenantId) {
      skippedUsers.push({
        userId: user._id,
        reason: "missing tenantId",
      });
      continue;
    }

    if (user.role === "platform_admin") {
      platformRolesToCreate.push({
        userId: user._id,
        role: "platform_admin",
      });
      continue;
    }

    membershipsToCreate.push({
      userId: user._id,
      tenantId: user.tenantId,
      role: roleMap[user.role] || "user",
      isVerified: Boolean(user.isVerified),
      status: user.suspended ? "suspended" : "active",
    });
  }

  const duplicateEmailConflicts = [...duplicateEmails.entries()]
    .filter(([, accounts]) => accounts.length > 1)
    .map(([email, accounts]) => ({
      email,
      accountCount: accounts.length,
      accounts: accounts.map((account) => ({
        userId: account._id,
        tenantId: account.tenantId,
        role: account.role,
      })),
    }));

  if (mode === "execute" && duplicateEmailConflicts.length > 0) {
    console.error("Migration blocked because duplicate-email conflicts require manual resolution.");
    console.log(JSON.stringify({ mode, duplicateEmailConflicts }, null, 2));
    process.exitCode = 2;
  } else {
    let createdMemberships = 0;
    let matchedMemberships = 0;
    let createdPlatformRoles = 0;
    let matchedPlatformRoles = 0;

    if (mode === "execute") {
      for (const membership of membershipsToCreate) {
        const result = await TenantMembership.updateOne(
          { userId: membership.userId, tenantId: membership.tenantId },
          { $setOnInsert: membership },
          { upsert: true }
        );
        if (result.upsertedCount) createdMemberships += 1;
        else matchedMemberships += 1;
      }

      for (const platformRole of platformRolesToCreate) {
        const result = await PlatformRole.updateOne(
          { userId: platformRole.userId, role: "platform_admin" },
          { $setOnInsert: platformRole },
          { upsert: true }
        );
        if (result.upsertedCount) createdPlatformRoles += 1;
        else matchedPlatformRoles += 1;
      }
    }

    console.log(JSON.stringify({
      mode,
      summary: {
        usersInspected: users.length,
        membershipsPrepared: membershipsToCreate.length,
        platformRolesPrepared: platformRolesToCreate.length,
        skippedUsers: skippedUsers.length,
        duplicateEmailConflicts: duplicateEmailConflicts.length,
        createdMemberships,
        matchedMemberships,
        createdPlatformRoles,
        matchedPlatformRoles,
      },
      skippedUsers,
      duplicateEmailConflicts,
    }, null, 2));
  }
} catch (error) {
  console.error("Membership migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
