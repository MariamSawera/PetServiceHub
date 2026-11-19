import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import TenantMembership from "../models/TenantMembership.js";
import PlatformRole from "../models/PlatformRole.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (user.suspended) {
      return res.status(403).json({ message: "Account is suspended" });
    }

    const platformRole = await PlatformRole.findOne({
      userId: user._id,
      role: "platform_admin",
    });
    req.platformRole = platformRole || null;
    req.isPlatformAdmin = Boolean(platformRole);

    req.user = user;

    if (req.tenantId) {
      const membership = await TenantMembership.findOne({
        userId: user._id,
        tenantId: req.tenantId,
      });

      if (membership) {
        req.membership = membership;
        req.tenantRole = membership.role;
        if (membership.status !== "active" && !req.isPlatformAdmin) {
          return res.status(403).json({ message: "Tenant membership is not active" });
        }
      } else if (!req.isPlatformAdmin) {
        return res.status(403).json({ message: "No tenant membership" });
      }
    }

    if (req.tenant && !req.tenant.active && !req.isPlatformAdmin) {
      return res.status(403).json({ message: "Tenant is inactive" });
    }

    if (!req.tenantId && !req.isPlatformAdmin) {
      return res.status(401).json({ message: "Invalid tenant context" });
    }
    next();
  } catch (error) {
    console.error("protectRoute error", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protectRoute;
