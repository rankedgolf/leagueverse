export function validateCreateLeagueInput(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const sportKey = String(formData.get("sport") || "").trim();

  if (!name) {
    throw new Error("League name is required.");
  }

  if (!sportKey) {
    throw new Error("Sport is required.");
  }

  return {
    name,
    sportKey,
  };
}

export function createSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}