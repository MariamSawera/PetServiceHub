import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";

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

    if (!user.tenantId) {
      return res.status(401).json({ message: "Invalid tenant context" });
    }
    if (req.tenantId && String(req.tenantId) !== String(user.tenantId)) {
      if (req.tenantExplicit) return res.status(403).json({ message: "User does not belong to this tenant" });
      const userTenant = await Tenant.findOne({ _id: user.tenantId, active: true });
      if (!userTenant) return res.status(401).json({ message: "Invalid tenant context" });
      req.tenant = userTenant;
      req.tenantId = userTenant._id;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("protectRoute error", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protectRoute;
