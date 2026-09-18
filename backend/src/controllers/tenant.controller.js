import Tenant from "../models/Tenant.js";

export const createTenant = async (req, res) => {
  const { name, slug } = req.body;
  if (!name?.trim() || !slug?.trim() || !/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ message: "A name and lowercase slug are required" });
  }

  try {
    const tenant = await Tenant.create({ name: name.trim(), slug: slug.toLowerCase().trim() });
    return res.status(201).json(tenant);
  } catch (error) {
    console.error("createTenant error", error);
    return res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "Tenant slug already exists" : "Invalid tenant data" });
  }
};