export function validateCreateTeamInput(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const nickname = String(formData.get("nickname") || "").trim();
  const abbreviation = String(formData.get("abbreviation") || "")
    .trim()
    .toUpperCase();

  if (!name) {
    throw new Error("Team name is required.");
  }

  return {
    name,
    nickname: nickname || null,
    abbreviation: abbreviation || null,
  };
}