import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorName: { type: String, required: true, trim: true },
    actorEmail: { type: String, required: true, trim: true, lowercase: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, trim: true, index: true },
    targetType: { type: String, required: true, trim: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", index: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, trim: true, default: "" },
    userAgent: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
