import mongoose from "mongoose";

const platformRoleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["platform_admin"],
      required: true,
      default: "platform_admin",
    },
  },
  {
    timestamps: true,
  }
);

platformRoleSchema.index({ userId: 1, role: 1 }, { unique: true });

const PlatformRole = mongoose.model("PlatformRole", platformRoleSchema);

export default PlatformRole;
