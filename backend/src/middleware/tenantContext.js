import Tenant from "../models/Tenant.js";

const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG || "default";

const tenantSlugFromRequest = (req) => {
  const headerSlug = req.get("x-tenant-slug");
  if (headerSlug) return headerSlug.toLowerCase();

  const host = req.get("host")?.split(":")[0];
  const baseHost = process.env.TENANT_BASE_DOMAIN;
  if (baseHost && host?.endsWith(`.${baseHost}`)) return host.slice(0, -(baseHost.length + 1)).toLowerCase();
  return DEFAULT_TENANT_SLUG;
};

export const resolveTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ slug: tenantSlugFromRequest(req), active: true });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    req.tenant = tenant;
    req.tenantId = tenant._id;
    next();
  } catch (error) {
    console.error("resolveTenant error", error);
    return res.status(500).json({ message: "Could not resolve tenant" });
  }
};

export const ensureDefaultTenant = async () => Tenant.findOneAndUpdate(
  { slug: DEFAULT_TENANT_SLUG },
  { $setOnInsert: { name: "PawCare", slug: DEFAULT_TENANT_SLUG } },
  { new: true, upsert: true, setDefaultsOnInsert: true }
);