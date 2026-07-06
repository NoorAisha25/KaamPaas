/**
 * Trust Score = weighted combination of:
 *   - average rating from reviews (0-5, scaled to 0-60)
 *   - completion rate: completed / (completed + cancelled), scaled to 0-30
 *   - verification bonus: flat +10 if ID-verified
 *
 * This is a deliberately transparent, explainable formula rather than a
 * trained ML model - the dataset (reviews) is small and the logic needs
 * to be auditable, which matters more than raw predictive power here.
 *
 * This score is what userController.searchWorkers actually sorts by -
 * it is not just a displayed number, it is the ranking mechanism. A
 * plumber with more 5-star completed jobs will out-rank a plumber with
 * fewer or lower ratings when a hirer searches, even if both are in the
 * same city. That's the real "reward good work" loop.
 */
export const calculateTrustScore = (user) => {
  const { ratingAvg = 0, jobsDone = 0, cancelledJobs = 0, isVerified = false } = user;

  const ratingScore = (ratingAvg / 5) * 60; // 0-60

  const totalJobs = jobsDone + cancelledJobs;
  // New users with zero history get completionRate = 1 (benefit of the
  // doubt) so they aren't ranked at the bottom just for being new.
  const completionRate = totalJobs === 0 ? 1 : jobsDone / totalJobs;
  const completionScore = completionRate * 30; // 0-30

  const verificationScore = isVerified ? 10 : 0;

  const trustScore = Math.round(ratingScore + completionScore + verificationScore);
  return Math.min(100, Math.max(0, trustScore));
};
