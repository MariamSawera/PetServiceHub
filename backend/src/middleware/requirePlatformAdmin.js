import PlatformRole from "../models/PlatformRole.js";

export const requirePlatformAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Authentication required" });
  if (req.user.suspended) return res.status(403).json({ message: "Account is suspended" });

  try {
    const platformRole = await PlatformRole.findOne({
      userId: req.user._id,
      role: "platform_admin",
    });

    if (!platformRole) return res.status(403).json({ message: "Platform administrator access required" });

    req.platformRole = platformRole;
    req.isPlatformAdmin = true;
    next();
  } catch (error) {
    console.error("requirePlatformAdmin error", error);
    return res.status(500).json({ message: "Could not verify platform role" });
  }
};
