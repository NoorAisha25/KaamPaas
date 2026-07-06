import User from "../models/User.js";
import Job from "../models/Job.js";

const DEFAULT_RADIUS_KM = 10;

/**
 * Finds available workers near a given point, matching a skill.
 * This is what makes search genuinely hyperlocal (a few km radius)
 * instead of "somewhere in this city or state" - the actual point of
 * the app for daily-wage work, where travel distance matters a lot.
 *
 * Falls back to city-text + skill matching if no coordinates are given
 * (e.g. the hirer denied location permission) - never a hard failure.
 */
export const findNearbyWorkers = async ({ lng, lat, skill, city, radiusKm = DEFAULT_RADIUS_KM }) => {
  const baseFilter = { role: "worker", available: true };
  if (skill && skill !== "all") baseFilter.skills = skill;

  if (typeof lng === "number" && typeof lat === "number") {
    const workers = await User.find({
      ...baseFilter,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    }).select("-password");

    // $near already returns results sorted closest-first. Re-rank with a
    // blended score so a much more trustworthy worker slightly farther
    // away can still outrank the closest-but-untested one.
    return workers
      .map((worker, index) => {
        const proximityScore = (workers.length - index) / workers.length; // 0-1, closest = highest
        const trustScore = (worker.trustScore || 0) / 100; // 0-1
        const blended = proximityScore * 0.6 + trustScore * 0.4;
        return { worker, blended };
      })
      .sort((a, b) => b.blended - a.blended)
      .map((entry) => entry.worker);
  }

  // Fallback: no coordinates available, use city text + trust score
  if (city) baseFilter.city = { $regex: city, $options: "i" };
  return User.find(baseFilter).select("-password").sort({ trustScore: -1, ratingAvg: -1 });
};

/**
 * Finds open jobs near a worker's location. Supports two modes:
 *   - explicit `skill` (a single skill id, or "all") - this is the
 *     skill-pill filter bar on the Find Jobs page, letting a worker
 *     browse every nearby open job, not just ones matching their profile
 *   - `skills` (the worker's registered skills array) - used only when
 *     no explicit skill filter is given, as a personalized default
 */
export const findNearbyJobs = async ({ lng, lat, skill, skills = [], city, radiusKm = DEFAULT_RADIUS_KM }) => {
  const baseFilter = { status: "open" };

  if (skill && skill !== "all") {
    baseFilter.skill = skill;
  } else if (!skill && skills.length > 0) {
    // No explicit filter chosen yet - default to the worker's own skills
    baseFilter.skill = { $in: skills };
  }
  // skill === "all" -> no skill filter at all, show every nearby open job

  if (typeof lng === "number" && typeof lat === "number") {
    return Job.find({
      ...baseFilter,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    }).populate("hirer", "name phone trustScore ratingAvg");
  }

  if (city) baseFilter.city = { $regex: city, $options: "i" };
  return Job.find(baseFilter).populate("hirer", "name phone trustScore ratingAvg").sort({ createdAt: -1 });
};
