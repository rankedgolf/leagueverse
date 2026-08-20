"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

import { requireLeagueEntitlement } from "@/features/billing/services/require-league-entitlement";

import {
  ManualImportPlayerMatcher,
} from "@/features/manual-import/services/manual-import-player-matcher";

import type {
  ManualImportPreview,
  ManualImportTeam,
  ManualImportContract,
  ManualImportDraftPick,
} from "@/features/manual-import/services/workbook-parser";

type ConfirmManualImportInput = {
  leagueId: string;
  workbook: ManualImportPreview;
};

export type ConfirmManualImportResult = {
  success: boolean;

  createdTeams: number;
  existingTeams: number;

  rosterPlayers: number;
  createdLeaguePlayers: number;
  createdRosterEntries: number;
  updatedRosterEntries: number;

  contractsCreated: number;
  contractsUpdated: number;

  draftPicksCreatedOrUpdated: number;

  errors: string[];
};

type TeamMap = Map<
  string,
  string
>;

type PlayerMap = Map<
  string,
  string
>;

type LeaguePlayerMap = Map<
  string,
  string
>;

type SeasonMap = Map<
  number,
  string
>;

function normalizeName(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      "",
    );
}

function buildRosterKey(
  teamName: string,
  playerName: string,
): string {
  return [
    normalizeName(
      teamName,
    ),
    normalizeName(
      playerName,
    ),
  ].join(":");
}

function normalizeContractType(
  value: string | null,
): string {
  if (!value) {
    return "standard";
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function normalizeDraftPickStatus(
  value: string | null,
): "active" | "used" | "forfeited" {
  if (!value) {
    return "active";
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  if (
    normalized === "active" ||
    normalized === "used" ||
    normalized === "forfeited"
  ) {
    return normalized;
  }

  throw new Error(
    `Invalid draft pick status "${value}".`,
  );
}

export async function confirmManualImport(
  input: ConfirmManualImportInput,
): Promise<ConfirmManualImportResult> {
  /*
   * ------------------------------------------------------------
   * AUTHORIZATION + PAID ENTITLEMENT
   * ------------------------------------------------------------
   */

  await AuthorizationService.requirePermission({
    leagueId:
      input.leagueId,

    permission:
      Permissions.ManageLeague,
  });

  await AuthorizationService.requirePermission({
    leagueId:
      input.leagueId,

    permission:
      Permissions.ManagePlayers,
  });

  await AuthorizationService.requirePermission({
    leagueId:
      input.leagueId,

    permission:
      Permissions.ManageRosters,
  });

  await AuthorizationService.requirePermission({
    leagueId:
      input.leagueId,

    permission:
      Permissions.ManageContracts,
  });

  await AuthorizationService.requirePermission({
    leagueId:
      input.leagueId,

    permission:
      Permissions.ManageDraft,
  });

  await requireLeagueEntitlement(
    input.leagueId,
  );

  /*
   * ------------------------------------------------------------
   * BASIC INPUT VALIDATION
   * ------------------------------------------------------------
   */

  if (
    input.workbook.teams.length ===
    0
  ) {
    throw new Error(
      "The workbook does not contain any teams.",
    );
  }

  if (
    input.workbook.rosters.length ===
    0
  ) {
    throw new Error(
      "The workbook does not contain any roster players.",
    );
  }

  if (
    input.workbook.teams.length >
    100
  ) {
    throw new Error(
      "Manual imports are limited to 100 teams.",
    );
  }

  if (
    input.workbook.rosters.length >
    1000
  ) {
    throw new Error(
      "Manual imports are limited to 1,000 roster players.",
    );
  }

  /*
   * ------------------------------------------------------------
   * RE-RUN PLAYER MATCHING SERVER-SIDE
   *
   * Never trust IDs supplied by the browser.
   * ------------------------------------------------------------
   */

  const playerMatching =
    await ManualImportPlayerMatcher.build(
      input.workbook,
    );

  if (
    !playerMatching.canImport
  ) {
    throw new Error(
      `The import cannot continue. ${playerMatching.unmatched} player(s) are unmatched and ${playerMatching.ambiguous} player(s) require review.`,
    );
  }

  const supabase =
    await createClient();

  /*
   * ------------------------------------------------------------
   * ACTIVE SEASON
   * ------------------------------------------------------------
   */

  const {
    data: activeSeason,
    error: activeSeasonError,
  } =
    await supabase
      .from("seasons")
      .select(`
        id,
        year,
        name
      `)
      .eq(
        "league_id",
        input.leagueId,
      )
      .eq(
        "is_active",
        true,
      )
      .maybeSingle();

  if (activeSeasonError) {
    throw new Error(
      activeSeasonError.message,
    );
  }

  if (!activeSeason) {
    throw new Error(
      "This league does not have an active season.",
    );
  }

  /*
   * ------------------------------------------------------------
   * PREVENT DUPLICATE TEAM NAMES INSIDE WORKBOOK
   * ------------------------------------------------------------
   */

  const seenTeamNames =
    new Set<string>();

  for (
    const team of
    input.workbook.teams
  ) {
    const key =
      normalizeName(
        team.teamName,
      );

    if (!key) {
      throw new Error(
        "A team is missing its name.",
      );
    }

    if (
      seenTeamNames.has(
        key,
      )
    ) {
      throw new Error(
        `Duplicate team "${team.teamName}" was found in the workbook.`,
      );
    }

    seenTeamNames.add(
      key,
    );
  }

  /*
   * ------------------------------------------------------------
   * TEAM RESOLUTION
   * ------------------------------------------------------------
   */

  const {
    data: existingTeamRows,
    error: existingTeamsError,
  } =
    await supabase
      .from("teams")
      .select(`
        id,
        name
      `)
      .eq(
        "league_id",
        input.leagueId,
      );

  if (existingTeamsError) {
    throw new Error(
      existingTeamsError.message,
    );
  }

  const teamMap: TeamMap =
    new Map();

  for (
    const team of
    existingTeamRows ?? []
  ) {
    teamMap.set(
      normalizeName(
        team.name,
      ),
      team.id,
    );
  }

  let createdTeams = 0;
  let existingTeams = 0;

  for (
    const importedTeam of
    input.workbook.teams
  ) {
    const normalizedTeamName =
      normalizeName(
        importedTeam.teamName,
      );

    const existingTeamId =
      teamMap.get(
        normalizedTeamName,
      );

    if (existingTeamId) {
      existingTeams += 1;

      continue;
    }

    const teamId =
      await createImportedTeam({
        leagueId:
          input.leagueId,

        team:
          importedTeam,
      });

    teamMap.set(
      normalizedTeamName,
      teamId,
    );

    createdTeams += 1;
  }

  /*
   * ------------------------------------------------------------
   * BUILD SAFE PLAYER MAP
   * ------------------------------------------------------------
   */

  const playerMap: PlayerMap =
    new Map();

  for (
    const match of
    playerMatching.matches
  ) {
    if (
      match.status !==
        "matched" ||
      !match.playerId
    ) {
      throw new Error(
        `Player "${match.importedPlayerName}" could not be safely resolved.`,
      );
    }

    playerMap.set(
      buildRosterKey(
        match.teamName,
        match.importedPlayerName,
      ),
      match.playerId,
    );
  }

  /*
   * ------------------------------------------------------------
   * ROSTERS + LEAGUE PLAYERS
   * ------------------------------------------------------------
   */

  const leaguePlayerMap: LeaguePlayerMap =
    new Map();

  let rosterPlayers = 0;
  let createdLeaguePlayers = 0;
  let createdRosterEntries = 0;
  let updatedRosterEntries = 0;

  for (
    const roster of
    input.workbook.rosters
  ) {
    const teamId =
      teamMap.get(
        normalizeName(
          roster.teamName,
        ),
      );

    if (!teamId) {
      throw new Error(
        `Roster team "${roster.teamName}" could not be resolved.`,
      );
    }

    const playerId =
      playerMap.get(
        buildRosterKey(
          roster.teamName,
          roster.playerName,
        ),
      );

    if (!playerId) {
      throw new Error(
        `Roster player "${roster.playerName}" could not be resolved.`,
      );
    }

    /*
     * Ensure league_players row.
     */
    const {
      data: existingLeaguePlayer,
      error: existingLeaguePlayerError,
    } =
      await supabase
        .from("league_players")
        .select(`
          id,
          current_team_id
        `)
        .eq(
          "league_id",
          input.leagueId,
        )
        .eq(
          "player_id",
          playerId,
        )
        .maybeSingle();

    if (
      existingLeaguePlayerError
    ) {
      throw new Error(
        existingLeaguePlayerError.message,
      );
    }

    let leaguePlayerId: string;

    if (
      existingLeaguePlayer
    ) {
      leaguePlayerId =
        existingLeaguePlayer.id;

      const {
        error,
      } =
        await supabase
          .from("league_players")
          .update({
            status:
              "rostered",

            current_team_id:
              teamId,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            leaguePlayerId,
          )
          .eq(
            "league_id",
            input.leagueId,
          );

      if (error) {
        throw new Error(
          error.message,
        );
      }
    } else {
      const {
        data,
        error,
      } =
        await supabase
          .from("league_players")
          .insert({
            league_id:
              input.leagueId,

            player_id:
              playerId,

            status:
              "rostered",

            current_team_id:
              teamId,
          })
          .select("id")
          .single();

      if (error) {
        throw new Error(
          error.message,
        );
      }

      leaguePlayerId =
        data.id;

      createdLeaguePlayers +=
        1;
    }

    leaguePlayerMap.set(
      buildRosterKey(
        roster.teamName,
        roster.playerName,
      ),
      leaguePlayerId,
    );

    /*
     * Ensure team_rosters row.
     */
    const {
      data: existingRoster,
      error: existingRosterError,
    } =
      await supabase
        .from("team_rosters")
        .select(`
          id,
          team_id
        `)
        .eq(
          "league_id",
          input.leagueId,
        )
        .eq(
          "season_id",
          activeSeason.id,
        )
        .eq(
          "player_id",
          playerId,
        )
        .maybeSingle();

    if (
      existingRosterError
    ) {
      throw new Error(
        existingRosterError.message,
      );
    }

    if (
      existingRoster
    ) {
      const {
        error,
      } =
        await supabase
          .from("team_rosters")
          .update({
            team_id:
              teamId,

            roster_slot:
              roster.rosterStatus ??
              "active",

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            existingRoster.id,
          )
          .eq(
            "league_id",
            input.leagueId,
          );

      if (error) {
        throw new Error(
          error.message,
        );
      }

      updatedRosterEntries +=
        1;
    } else {
      const {
        error,
      } =
        await supabase
          .from("team_rosters")
          .insert({
            league_id:
              input.leagueId,

            season_id:
              activeSeason.id,

            team_id:
              teamId,

            player_id:
              playerId,

            roster_slot:
              roster.rosterStatus ??
              "active",

            acquired_type:
              "spreadsheet_import",

            acquired_at:
              new Date().toISOString(),
          });

      if (error) {
        throw new Error(
          error.message,
        );
      }

      createdRosterEntries +=
        1;
    }

    rosterPlayers +=
      1;
  }

  /*
   * ------------------------------------------------------------
   * CONTRACTS
   * ------------------------------------------------------------
   */

  const seasonMap: SeasonMap =
    new Map();

  seasonMap.set(
    activeSeason.year,
    activeSeason.id,
  );

  let contractsCreated = 0;
  let contractsUpdated = 0;

  for (
    const contract of
    input.workbook.contracts
  ) {
    const result =
      await importContract({
        leagueId:
          input.leagueId,

        activeSeasonYear:
          activeSeason.year,

        contract,

        teamMap,

        leaguePlayerMap,

        seasonMap,
      });

    if (
      result === "created"
    ) {
      contractsCreated +=
        1;
    } else {
      contractsUpdated +=
        1;
    }
  }

  /*
   * ------------------------------------------------------------
   * DRAFT PICKS
   * ------------------------------------------------------------
   */

  let draftPicksCreatedOrUpdated =
    0;

  for (
    const pick of
    input.workbook.draftPicks
  ) {
    await importDraftPick({
      leagueId:
        input.leagueId,

      pick,

      teamMap,

      seasonMap,

      activeSeasonYear:
        activeSeason.year,
    });

    draftPicksCreatedOrUpdated +=
      1;
  }

  /*
   * ------------------------------------------------------------
   * REVALIDATE
   * ------------------------------------------------------------
   */

  const paths = [
    `/leagues/${input.leagueId}`,
    `/leagues/${input.leagueId}/teams`,
    `/leagues/${input.leagueId}/players`,
    `/leagues/${input.leagueId}/rosters`,
    `/leagues/${input.leagueId}/contracts`,
    `/leagues/${input.leagueId}/salary-cap`,
    `/leagues/${input.leagueId}/draft`,
    `/leagues/${input.leagueId}/import/manual`,
  ];

  for (
    const path of paths
  ) {
    revalidatePath(
      path,
    );
  }

  return {
    success:
      true,

    createdTeams,

    existingTeams,

    rosterPlayers,

    createdLeaguePlayers,

    createdRosterEntries,

    updatedRosterEntries,

    contractsCreated,

    contractsUpdated,

    draftPicksCreatedOrUpdated,

    errors: [],
  };
}

/*
 * ============================================================
 * TEAM
 * ============================================================
 */

async function createImportedTeam(params: {
  leagueId: string;

  team: ManualImportTeam;
}): Promise<string> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase
      .from("teams")
      .insert({
        league_id:
          params.leagueId,

        name:
          params.team.teamName.trim(),

        nickname:
          params.team.nickname,

        abbreviation:
          params.team.abbreviation,

        primary_color:
          params.team.primaryColor,

        secondary_color:
          params.team.secondaryColor,
      })
      .select("id")
      .single();

  if (error) {
    throw new Error(
      `Unable to create team "${params.team.teamName}": ${error.message}`,
    );
  }

  return data.id;
}

/*
 * ============================================================
 * SEASON
 * ============================================================
 */

async function ensureSeason(params: {
  leagueId: string;

  year: number;

  seasonMap: SeasonMap;

  activeSeasonYear: number;
}): Promise<string> {
  const cached =
    params.seasonMap.get(
      params.year,
    );

  if (cached) {
    return cached;
  }

  const supabase =
    await createClient();

  const {
    data: existingSeason,
    error: existingError,
  } =
    await supabase
      .from("seasons")
      .select("id")
      .eq(
        "league_id",
        params.leagueId,
      )
      .eq(
        "year",
        params.year,
      )
      .maybeSingle();

  if (existingError) {
    throw new Error(
      existingError.message,
    );
  }

  if (existingSeason) {
    params.seasonMap.set(
      params.year,
      existingSeason.id,
    );

    return existingSeason.id;
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("seasons")
      .insert({
        league_id:
          params.leagueId,

        name:
          `${params.year} Season`,

        year:
          params.year,

        status:
          params.year >
          params.activeSeasonYear
            ? "future"
            : "completed",

        is_active:
          false,
      })
      .select("id")
      .single();

  if (error) {
    throw new Error(
      `Unable to create ${params.year} season: ${error.message}`,
    );
  }

  params.seasonMap.set(
    params.year,
    data.id,
  );

  return data.id;
}

/*
 * ============================================================
 * CONTRACT
 * ============================================================
 */

async function importContract(params: {
  leagueId: string;

  activeSeasonYear: number;

  contract: ManualImportContract;

  teamMap: TeamMap;

  leaguePlayerMap: LeaguePlayerMap;

  seasonMap: SeasonMap;
}): Promise<
  "created" |
  "updated"
> {
  const supabase =
    await createClient();

  const teamId =
    params.teamMap.get(
      normalizeName(
        params.contract.teamName,
      ),
    );

  if (!teamId) {
    throw new Error(
      `Contract team "${params.contract.teamName}" could not be resolved.`,
    );
  }

  const rosterKey =
    buildRosterKey(
      params.contract.teamName,
      params.contract.playerName,
    );

  const leaguePlayerId =
    params.leaguePlayerMap.get(
      rosterKey,
    );

  if (!leaguePlayerId) {
    throw new Error(
      `Contract player "${params.contract.playerName}" is not on the imported roster.`,
    );
  }

  const yearsRemaining =
    params.contract.yearsRemaining;

  const annualSalary =
    params.contract.annualSalary;

  if (
    yearsRemaining ===
      null ||
    yearsRemaining <
      1
  ) {
    throw new Error(
      `Contract for "${params.contract.playerName}" has an invalid term.`,
    );
  }

  if (
    annualSalary ===
      null ||
    annualSalary <
      0
  ) {
    throw new Error(
      `Contract for "${params.contract.playerName}" has an invalid salary.`,
    );
  }

  /*
   * "Years Remaining" is authoritative for migration.
   *
   * Start at the league's active season and build forward.
   */
  const startYear =
    params.activeSeasonYear;

  const endYear =
    startYear +
    yearsRemaining -
    1;

  const startSeasonId =
    await ensureSeason({
      leagueId:
        params.leagueId,

      year:
        startYear,

      seasonMap:
        params.seasonMap,

      activeSeasonYear:
        params.activeSeasonYear,
    });

  const endSeasonId =
    await ensureSeason({
      leagueId:
        params.leagueId,

      year:
        endYear,

      seasonMap:
        params.seasonMap,

      activeSeasonYear:
        params.activeSeasonYear,
    });

  const totalValue =
    annualSalary *
    yearsRemaining;

  const {
    data: existingContracts,
    error: existingContractError,
  } =
    await supabase
      .from("contracts")
      .select(`
        id,
        created_at
      `)
      .eq(
        "league_id",
        params.leagueId,
      )
      .eq(
        "league_player_id",
        leaguePlayerId,
      )
      .eq(
        "status",
        "active",
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      )
      .limit(
        1,
      );

  if (
    existingContractError
  ) {
    throw new Error(
      existingContractError.message,
    );
  }

  const existingContract =
    existingContracts?.[0] ??
    null;

  let contractId: string;

  let result:
    | "created"
    | "updated";

  if (
    existingContract
  ) {
    contractId =
      existingContract.id;

    const {
      error,
    } =
      await supabase
        .from("contracts")
        .update({
          team_id:
            teamId,

          contract_type:
            normalizeContractType(
              params.contract.contractType,
            ),

          status:
            "active",

          starts_season_id:
            startSeasonId,

          ends_season_id:
            endSeasonId,

          total_value:
            totalValue,

          guaranteed_value:
            params.contract.guaranteedValue ??
            0,

          notes:
            params.contract.notes,

          source:
            "spreadsheet_import",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          contractId,
        )
        .eq(
          "league_id",
          params.leagueId,
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    /*
     * Rebuild years so retries do not
     * create duplicate contract years.
     */
    const {
      error:
        deleteYearsError,
    } =
      await supabase
        .from("contract_years")
        .delete()
        .eq(
          "contract_id",
          contractId,
        );

    if (
      deleteYearsError
    ) {
      throw new Error(
        deleteYearsError.message,
      );
    }

    result =
      "updated";
  } else {
    const {
      data,
      error,
    } =
      await supabase
        .from("contracts")
        .insert({
          league_id:
            params.leagueId,

          team_id:
            teamId,

          league_player_id:
            leaguePlayerId,

          contract_type:
            normalizeContractType(
              params.contract.contractType,
            ),

          status:
            "active",

          starts_season_id:
            startSeasonId,

          ends_season_id:
            endSeasonId,

          total_value:
            totalValue,

          guaranteed_value:
            params.contract.guaranteedValue ??
            0,

          notes:
            params.contract.notes,

          source:
            "spreadsheet_import",
        })
        .select("id")
        .single();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    contractId =
      data.id;

    result =
      "created";
  }

  const contractYears: Array<{
    contract_id: string;
    league_id: string;
    season_id: string;
    salary: number;
    bonus: number;
    guaranteed_amount: number;
    is_option_year: boolean;
  }> = [];

  for (
    let index = 0;
    index <
    yearsRemaining;
    index += 1
  ) {
    const year =
      startYear +
      index;

    const seasonId =
      await ensureSeason({
        leagueId:
          params.leagueId,

        year,

        seasonMap:
          params.seasonMap,

        activeSeasonYear:
          params.activeSeasonYear,
      });

    contractYears.push({
      contract_id:
        contractId,

      league_id:
        params.leagueId,

      season_id:
        seasonId,

      salary:
        annualSalary,

      /*
       * A workbook signing bonus is applied
       * in Year 1 of the imported remaining deal.
       */
      bonus:
        index === 0
          ? params.contract.signingBonus ??
            0
          : 0,

      /*
       * Preserve the total guarantee without
       * multiplying it across every contract year.
       */
      guaranteed_amount:
        index === 0
          ? params.contract.guaranteedValue ??
            0
          : 0,

      is_option_year:
        false,
    });
  }

  const {
    error:
      contractYearsError,
  } =
    await supabase
      .from(
        "contract_years",
      )
      .insert(
        contractYears,
      );

  if (
    contractYearsError
  ) {
    throw new Error(
      contractYearsError.message,
    );
  }

  return result;
}

/*
 * ============================================================
 * DRAFT PICK
 * ============================================================
 */

async function importDraftPick(params: {
  leagueId: string;

  pick: ManualImportDraftPick;

  teamMap: TeamMap;

  seasonMap: SeasonMap;

  activeSeasonYear: number;
}) {
  const supabase =
    await createClient();

  if (
    params.pick.seasonYear ===
    null
  ) {
    throw new Error(
      "A draft pick is missing its season year.",
    );
  }

  if (
    params.pick.round ===
      null ||
    params.pick.round <
      1
  ) {
    throw new Error(
      `A ${params.pick.seasonYear} draft pick has an invalid round.`,
    );
  }

  const originalTeamId =
    params.teamMap.get(
      normalizeName(
        params.pick.originalTeam,
      ),
    );

  const currentTeamId =
    params.teamMap.get(
      normalizeName(
        params.pick.currentTeam,
      ),
    );

  if (!originalTeamId) {
    throw new Error(
      `Draft pick original team "${params.pick.originalTeam}" could not be resolved.`,
    );
  }

  if (!currentTeamId) {
    throw new Error(
      `Draft pick current team "${params.pick.currentTeam}" could not be resolved.`,
    );
  }

  const seasonId =
    await ensureSeason({
      leagueId:
        params.leagueId,

      year:
        params.pick.seasonYear,

      seasonMap:
        params.seasonMap,

      activeSeasonYear:
        params.activeSeasonYear,
    });

  const {
    error,
  } =
    await supabase
      .from("draft_picks")
      .upsert(
        {
          league_id:
            params.leagueId,

          season_id:
            seasonId,

          round:
            params.pick.round,

          original_team_id:
            originalTeamId,

          current_team_id:
            currentTeamId,

          pick_number:
            params.pick.pickNumber,

          status:
            normalizeDraftPickStatus(
              params.pick.status,
            ),

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict:
            "league_id,season_id,round,original_team_id",
        },
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }
}