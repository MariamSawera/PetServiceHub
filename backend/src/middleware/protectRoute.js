import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

    if (!user.tenantId || (decoded.tenantId && String(user.tenantId) !== String(decoded.tenantId))) {
      return res.status(401).json({ message: "Invalid tenant context" });
    }
    if (req.tenantId && String(req.tenantId) !== String(user.tenantId)) {
      return res.status(403).json({ message: "User does not belong to this tenant" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("protectRoute error", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default protectRoute;
