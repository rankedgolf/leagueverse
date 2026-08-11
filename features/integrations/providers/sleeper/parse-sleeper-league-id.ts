const SLEEPER_LEAGUE_ID_PATTERN = /^\d+$/;

export function parseSleeperLeagueId(value: string): string {
  const trimmedValue = value.trim();

  if (SLEEPER_LEAGUE_ID_PATTERN.test(trimmedValue)) {
    return trimmedValue;
  }

  let url: URL;

  try {
    url = new URL(trimmedValue);
  } catch {
    throw new Error("Enter a valid Sleeper league URL or league ID.");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    hostname !== "sleeper.com" &&
    hostname !== "www.sleeper.com"
  ) {
    throw new Error("The URL must be a Sleeper league URL.");
  }

  const match = url.pathname.match(/\/leagues\/(\d+)/);

  if (!match?.[1]) {
    throw new Error("A Sleeper league ID could not be found in the URL.");
  }

  return match[1];
}