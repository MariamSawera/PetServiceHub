import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/ },
    active: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    subdomain: { type: String, trim: true, lowercase: true, maxlength: 100, sparse: true, unique: true, match: /^[a-z0-9-]*$/ },
    customDomain: { type: String, trim: true, lowercase: true, maxlength: 253, sparse: true, unique: true },
    branding: {
      logoUrl: { type: String, trim: true, maxlength: 1000, default: "" },
      primaryColor: { type: String, trim: true, maxlength: 20, default: "#0d9488" },
      secondaryColor: { type: String, trim: true, maxlength: 20, default: "#7c3aed" },
      supportEmail: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
    },
  },
  { timestamps: true }
);

const Tenant = mongoose.model("Tenant", tenantSchema);

export default Tenant;