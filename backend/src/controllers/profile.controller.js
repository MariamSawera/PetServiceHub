import Profile from "../models/Profile.js";

const PROFILE_FIELDS = [
  "fullName",
  "phone",
  "avatar",
  "bio",
  "address",
  "city",
  "state",
  "postalCode",
];

const profilePayload = (body = {}) => {
  return PROFILE_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
    return payload;
  }, {});
};

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(profile);
  } catch (error) {
    console.error("getProfile error", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const upsertProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: profilePayload(req.body), $setOnInsert: { userId: req.user._id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.json(profile);
  } catch (error) {
    console.error("upsertProfile error", error);
    return res.status(400).json({ message: "Invalid profile data" });
  }
};
