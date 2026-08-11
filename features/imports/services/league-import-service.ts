import { createClient } from "@/lib/supabase/server";
import { ContractGenerationService } from "@/features/contracts/services/contract-generation-service";

export type ImportLeaguePlayerInput = {
  leagueId: string;
  seasonId: string;

  fantasyTeamId: string;

  playerName: string;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  proTeam?: string | null;
  sport: string;

  startingSalary: number;
  contractYears: number;

  externalPlayerId?: string | null;
  source?: string;
};

export type ImportLeaguePlayerResult = {
  playerId: string;
  leaguePlayerId: string;
  rosterId: string;
  contractId: string;

  createdPlayer: boolean;
  createdLeaguePlayer: boolean;
  createdRosterEntry: boolean;
};

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function splitPlayerName(playerName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = playerName.trim().split(/\s+/);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export const LeagueImportService = {
  async importPlayer(
    input: ImportLeaguePlayerInput
  ): Promise<ImportLeaguePlayerResult> {
    const supabase = await createClient();

    const normalizedPlayerName = normalizeName(input.playerName);

    if (!normalizedPlayerName) {
      throw new Error("Player name is required.");
    }

    const parsedName = splitPlayerName(input.playerName);

    const firstName =
      input.firstName?.trim() || parsedName.firstName;

    const lastName =
      input.lastName?.trim() || parsedName.lastName;

    /*
     * Step 1:
     * Find the player in the global LeagueVerse player catalog.
     *
     * External IDs are preferred when an integration provides one.
     * Name matching is the fallback for CSV imports.
     */

    let player:
      | {
          id: string;
        }
      | null = null;

    if (input.externalPlayerId) {
      const { data, error } = await supabase
        .from("players")
        .select("id")
        .eq("sport", input.sport)
        .eq("external_id", input.externalPlayerId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      player = data;
    }

    if (!player) {
      const { data: candidatePlayers, error } = await supabase
        .from("players")
        .select(`
          id,
          display_name,
          full_name,
          first_name,
          last_name
        `)
        .eq("sport", input.sport);

      if (error) {
        throw new Error(error.message);
      }

      const matches = (candidatePlayers ?? []).filter(
        (candidate) => {
          const candidateName =
            candidate.display_name ??
            candidate.full_name ??
            [candidate.first_name, candidate.last_name]
              .filter(Boolean)
              .join(" ");

          return (
            normalizeName(candidateName ?? "") ===
            normalizedPlayerName
          );
        }
      );

      if (matches.length > 1) {
        throw new Error(
          `Multiple global players matched "${input.playerName}".`
        );
      }

      player = matches[0] ?? null;
    }

    let createdPlayer = false;

    if (!player) {
      const { data, error } = await supabase
        .from("players")
        .insert({
          first_name: firstName,
          last_name: lastName,
          full_name: input.playerName.trim(),
          display_name: input.playerName.trim(),
          position: input.position ?? null,
          pro_team: input.proTeam ?? null,
          sport: input.sport,
          status: "active",
          external_id: input.externalPlayerId ?? null,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      player = data;
      createdPlayer = true;
    }

    /*
     * Step 2:
     * Ensure the player exists inside this specific league.
     */

    const { data: existingLeaguePlayer, error: leaguePlayerLookupError } =
      await supabase
        .from("league_players")
        .select("id, current_team_id")
        .eq("league_id", input.leagueId)
        .eq("player_id", player.id)
        .maybeSingle();

    if (leaguePlayerLookupError) {
      throw new Error(leaguePlayerLookupError.message);
    }

    let leaguePlayerId: string;
    let createdLeaguePlayer = false;

    if (existingLeaguePlayer) {
      leaguePlayerId = existingLeaguePlayer.id;

      const { error } = await supabase
        .from("league_players")
        .update({
          status: "rostered",
          current_team_id: input.fantasyTeamId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingLeaguePlayer.id)
        .eq("league_id", input.leagueId);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { data, error } = await supabase
        .from("league_players")
        .insert({
          league_id: input.leagueId,
          player_id: player.id,
          status: "rostered",
          current_team_id: input.fantasyTeamId,
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      leaguePlayerId = data.id;
      createdLeaguePlayer = true;
    }

    /*
     * Step 3:
     * Ensure the player is on the imported fantasy roster.
     */

    const { data: existingRoster, error: rosterLookupError } =
      await supabase
        .from("team_rosters")
        .select("id, team_id")
        .eq("league_id", input.leagueId)
        .eq("season_id", input.seasonId)
        .eq("player_id", player.id)
        .maybeSingle();

    if (rosterLookupError) {
      throw new Error(rosterLookupError.message);
    }

    let rosterId: string;
    let createdRosterEntry = false;

    if (existingRoster) {
      rosterId = existingRoster.id;

      if (existingRoster.team_id !== input.fantasyTeamId) {
        const { error } = await supabase
          .from("team_rosters")
          .update({
            team_id: input.fantasyTeamId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRoster.id)
          .eq("league_id", input.leagueId);

        if (error) {
          throw new Error(error.message);
        }
      }
    } else {
      const { data, error } = await supabase
        .from("team_rosters")
        .insert({
          league_id: input.leagueId,
          season_id: input.seasonId,
          team_id: input.fantasyTeamId,
          player_id: player.id,
          roster_slot: "active",
          acquired_type: input.source ?? "import",
          acquired_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      rosterId = data.id;
      createdRosterEntry = true;
    }

    /*
     * Step 4:
     * Generate the active contract and its annual salary rows.
     */

    const contract = await ContractGenerationService.generate({
      leagueId: input.leagueId,
      teamId: input.fantasyTeamId,
      leaguePlayerId,
      startSeasonId: input.seasonId,
      startingSalary: input.startingSalary,
      lengthYears: input.contractYears,
      contractType: "auction",
      source:
        input.source === "espn" ||
        input.source === "yahoo" ||
        input.source === "sleeper"
          ? "platform_import"
          : "spreadsheet_import",
    });

    return {
      playerId: player.id,
      leaguePlayerId,
      rosterId,
      contractId: contract.contractId,
      createdPlayer,
      createdLeaguePlayer,
      createdRosterEntry,
    };
  },
};