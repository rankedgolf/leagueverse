export function validateUpdateTeamInput(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const nickname = String(formData.get("nickname") || "").trim();
  const abbreviation = String(formData.get("abbreviation") || "")
    .trim()
    .toUpperCase();
  const primaryColor = String(formData.get("primary_color") || "").trim();
  const secondaryColor = String(formData.get("secondary_color") || "").trim();
  const foundedYearRaw = String(formData.get("founded_year") || "").trim();

  if (!name) {
    throw new Error("Team name is required.");
  }

  const foundedYear = foundedYearRaw ? Number(foundedYearRaw) : null;

  return {
    name,
    nickname: nickname || null,
    abbreviation: abbreviation || null,
    primary_color: primaryColor || null,
    secondary_color: secondaryColor || null,
    founded_year: foundedYear,
  };
}