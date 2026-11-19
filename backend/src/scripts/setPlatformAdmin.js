import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import PlatformRole from "../models/PlatformRole.js";

const [email, tenantSlug = process.env.DEFAULT_TENANT_SLUG || "default"] = process.argv.slice(2);

if (!email) {
  console.error("Usage: npm run set-platform-admin -- <email> [tenant-slug]");
  process.exit(1);
}

try {
  await connectDB();
  const tenant = await Tenant.findOne({ slug: tenantSlug.toLowerCase() });
  if (!tenant) {
    console.error(`Tenant not found: ${tenantSlug}`);
    process.exit(1);
  }

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase(), tenantId: tenant._id },
    { $set: { role: "platform_admin" } },
    { new: true }
  );

  if (!user) {
    console.error(`User not found in tenant "${tenant.slug}": ${email}`);
    process.exit(1);
  }

  await PlatformRole.updateOne(
    { userId: user._id, role: "platform_admin" },
    { $setOnInsert: { userId: user._id, role: "platform_admin" } },
    { upsert: true }
  );

  console.log(`Platform-admin role assigned to ${user.email} in tenant ${tenant.slug}`);
} catch (error) {
  console.error("Could not set platform-admin role:", error.message);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}
