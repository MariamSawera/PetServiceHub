import mongoose from "mongoose";

const tenantMembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "provider", "tenant_admin"],
      required: true,
      default: "user",
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "suspended", "revoked"],
      default: "active",
      index: true,
    },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
  }
);

tenantMembershipSchema.index(
  { userId: 1, tenantId: 1 },
  { unique: true }
);

const TenantMembership = mongoose.model("TenantMembership", tenantMembershipSchema);

export default TenantMembership;
