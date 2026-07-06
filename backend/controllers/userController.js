import User from "../models/User.js";
import { findNearbyWorkers } from "../utils/matching.js";

export const getMyProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

export const updateMyProfile = async (req, res) => {
  const allowedFields = [
    "name",
    "skills",
    "dailyRate",
    "rateType",
    "available",
    "city",
    "location",
    "profilePhotoUrl",
    "preferredLanguage",
  ];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");
  res.json(user);
};

// GET /api/users/workers?skill=plumber&city=Delhi&lng=77.2&lat=28.6&radiusKm=10
// Powers the "Find Workers" page. If lng/lat are provided (the hirer
// granted browser location permission), this does real GPS-radius
// matching - the actual "nearby" promise, same pattern as Uber/Swiggy.
// Without coordinates, it gracefully falls back to the city text filter.
export const searchWorkers = async (req, res) => {
  try {
    const { skill, city, lng, lat, radiusKm } = req.query;

    const workers = await findNearbyWorkers({
      lng: lng !== undefined ? parseFloat(lng) : undefined,
      lat: lat !== undefined ? parseFloat(lat) : undefined,
      skill,
      city,
      radiusKm: radiusKm ? parseFloat(radiusKm) : undefined,
    });

    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
};
