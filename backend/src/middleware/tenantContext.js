import Tenant from "../models/Tenant.js";
import jwt from "jsonwebtoken";

const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG || "default";

const tenantSlugFromRequest = (req) => {
  const headerSlug = req.get("x-tenant-slug");
  if (headerSlug) return headerSlug.toLowerCase();

  const host = req.get("host")?.split(":")[0];
  const baseHost = process.env.TENANT_BASE_DOMAIN;
  if (baseHost && host?.endsWith(`.${baseHost}`)) return host.slice(0, -(baseHost.length + 1)).toLowerCase();
  return DEFAULT_TENANT_SLUG;
};

const tenantForHost = async (req) => {
  const host = req.get("host")?.split(":")[0]?.toLowerCase();
  if (!host) return null;

  const customTenant = await Tenant.findOne({ customDomain: host, active: true, deletedAt: null });
  if (customTenant) return customTenant;

  const baseHost = process.env.TENANT_BASE_DOMAIN?.toLowerCase();
  if (baseHost && host.endsWith(`.${baseHost}`)) {
    const subdomain = host.slice(0, -(baseHost.length + 1));
    return Tenant.findOne({ $or: [{ subdomain }, { slug: subdomain }], active: true, deletedAt: null });
  }
  return null;
};

export const resolveTenant = async (req, res, next) => {
  try {
    const headerSlug = req.get("x-tenant-slug");
    req.tenantExplicit = Boolean(headerSlug);
    let tenant;

    if (headerSlug) {
      tenant = await Tenant.findOne({ slug: headerSlug.toLowerCase(), active: true, deletedAt: null });
    } else {
      const token = req.cookies?.jwt || req.headers.authorization?.replace(/^Bearer\s+/i, "");
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          tenant = await Tenant.findOne({ _id: decoded.tenantId, active: true, deletedAt: null });
        } catch {
          tenant = null;
        }
      }

      if (!tenant) tenant = await tenantForHost(req);
      if (!tenant) tenant = await Tenant.findOne({ slug: tenantSlugFromRequest(req), active: true, deletedAt: null });
    }

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