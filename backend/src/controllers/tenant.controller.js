import Tenant from "../models/Tenant.js";
import { createAuditLog } from "../services/audit.service.js";

export const createTenant = async (req, res) => {
  const { name, slug, subdomain, customDomain, branding } = req.body;
  if (!name?.trim() || !slug?.trim() || !/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ message: "A name and lowercase slug are required" });
  }

  try {
    if (subdomain && !/^[a-z0-9-]+$/.test(subdomain)) {
      return res.status(400).json({ message: "Subdomain may contain only lowercase letters, numbers, and hyphens" });
    }
    if (customDomain && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(customDomain.toLowerCase())) {
      return res.status(400).json({ message: "Custom domain is invalid" });
    }
    const tenant = await Tenant.create({
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      subdomain: subdomain?.toLowerCase().trim() || undefined,
      customDomain: customDomain?.toLowerCase().trim() || undefined,
      branding: {
        logoUrl: branding?.logoUrl?.trim() || "",
        primaryColor: branding?.primaryColor?.trim() || "#0d9488",
        secondaryColor: branding?.secondaryColor?.trim() || "#7c3aed",
        supportEmail: branding?.supportEmail?.trim() || "",
      },
    });
    await createAuditLog(req, { action: "tenant.created", targetType: "tenant", targetId: tenant._id, tenantId: tenant._id, details: { name: tenant.name, slug: tenant.slug, source: "tenant-admin" } });
    return res.status(201).json(tenant);
  } catch (error) {
    console.error("createTenant error", error);
    return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "Tenant slug already exists" : "Invalid tenant data" });
  }
};