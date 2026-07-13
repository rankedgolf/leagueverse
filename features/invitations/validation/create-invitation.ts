export function validateCreateInvitationInput(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "team_owner").trim();

  if (!email) {
    throw new Error("Email is required.");
  }

  const allowedRoles = ["team_owner", "viewer", "co_commissioner"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role.");
  }

  return {
    email,
    role,
  };
}