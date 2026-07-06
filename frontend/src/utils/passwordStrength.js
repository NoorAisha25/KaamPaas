// Returns "weak" | "medium" | "strong" based on length and character
// variety. Deliberately simple and explainable rather than using an
// entropy calculation - the goal is a clear, actionable hint for users
// who may not be familiar with password requirements, not a security
// audit tool.
export const getPasswordStrength = (password) => {
  if (!password) return null;
  if (password.length < 6) return "weak";

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score >= 3) return "strong";
  if (score >= 1) return "medium";
  return "weak";
};
