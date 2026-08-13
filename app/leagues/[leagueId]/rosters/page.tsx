import { RosterService } from "@/features/rosters/services/roster-service";
import { SeasonService } from "@/features/seasons/services/season-service";
import { TeamRepository } from "@/features/teams/repositories/team-repository";
import { PlayerService } from "@/features/players/services/player-service";

import { AssignExistingPlayerForm } from "@/features/rosters/components/assign-existing-player-form";
import { RemoveRosterPlayerButton } from "@/features/rosters/components/remove-roster-player-button";
import { ReleasePlayerButton } from "@/features/releases/components/release-player-button";
import { FranchiseTagButton } from "@/features/franchise-tags/components/franchise-tag-button";
import { LeagueOperationService } from "@/features/league-operations/services/league-operation-service";

type RostersPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

function formatMoney(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function formatContractSource(
  source: string,
): string {
  return source
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default async function RostersPage({
  params,
}: RostersPageProps) {
  const { leagueId } = await params;

  const activeSeason =
    await SeasonService.getActiveSeasonByLeague(
      leagueId,
    );

  if (!activeSeason) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Rosters
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            No active season has been created for this league yet.
          </p>
        </div>
      </div>
    );
  }

  const [
  teams,
  players,
  rosterPlayers,
  isFranchiseTagWindowOpen,
] = await Promise.all([
  TeamRepository.getByLeague(
    leagueId,
  ),

  PlayerService.getPlayers(),

  RosterService.getLeagueRosterPlayers(
    leagueId,
    activeSeason.id,
  ),

  LeagueOperationService.isPhaseOpen({
    leagueId,
    seasonId: activeSeason.id,
    phase: "franchise_tag",
  }),
]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Rosters
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          {activeSeason.name}
        </p>
      </div>

      <AssignExistingPlayerForm
        leagueId={leagueId}
        seasonId={activeSeason.id}
        teams={teams.map((team) => ({
          id: team.id,
          name: team.name,
        }))}
        players={players.map((player) => ({
          id: player.id,
          displayName:
            player.displayName,
          position:
            player.position,
          proTeam:
            player.proTeam,
        }))}
      />

      <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-950">
        <table className="w-full min-w-[1050px] text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">
                Player
              </th>

              <th className="px-4 py-3 text-left">
                Team
              </th>

              <th className="px-4 py-3 text-center">
                Pos
              </th>

              <th className="px-4 py-3 text-center">
                Pro Team
              </th>

              <th className="px-4 py-3 text-left">
                Contract
              </th>

              <th className="px-4 py-3 text-right">
                Slot
              </th>

              <th className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {rosterPlayers.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No players have been added to rosters yet.
                </td>
              </tr>
            ) : (
              rosterPlayers.map(
                (player) => (
                  <tr
                    key={
                      player.rosterId
                    }
                    className="border-t border-gray-800 align-top"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {
                        player.playerName
                      }
                    </td>

                    <td className="px-4 py-3 text-gray-300">
                      {
                        player.teamName
                      }
                    </td>

                    <td className="px-4 py-3 text-center text-gray-300">
                      {
                        player.position ??
                        "-"
                      }
                    </td>

                    <td className="px-4 py-3 text-center text-gray-300">
                      {
                        player.proTeam ??
                        "-"
                      }
                    </td>

                    <td className="px-4 py-3">
                      {player.contract ? (
                        <details className="group">
                          <summary className="cursor-pointer list-none">
                            <div className="inline-flex flex-col gap-1">
                              <span className="font-medium text-white">
                                {
                                  player.contract
                                    .remainingYears
                                }{" "}
                                yr
                                {player
                                  .contract
                                  .remainingYears ===
                                1
                                  ? ""
                                  : "s"}{" "}
                                ·{" "}
                                {formatMoney(
                                  player
                                    .contract
                                    .totalValue,
                                )}{" "}
                                total
                              </span>

                              <span className="text-xs text-gray-400">
                                {formatMoney(
                                  player
                                    .contract
                                    .guaranteedValue,
                                )}{" "}
                                guaranteed
                                {player
                                  .contract
                                  .currentCapHit !==
                                null
                                  ? ` · ${formatMoney(
                                      player
                                        .contract
                                        .currentCapHit,
                                    )} current cap`
                                  : ""}
                              </span>

                              <span className="text-xs font-medium text-emerald-400 group-open:hidden">
                                View breakdown
                              </span>

                              <span className="hidden text-xs font-medium text-emerald-400 group-open:inline">
                                Hide breakdown
                              </span>
                            </div>
                          </summary>

                          <div className="mt-3 min-w-[320px] rounded-lg border border-gray-800 bg-gray-900 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                  Contract Details
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {formatContractSource(
                                    player
                                      .contract
                                      .source,
                                  )}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm font-semibold text-white">
                                  {formatMoney(
                                    player
                                      .contract
                                      .totalValue,
                                  )}
                                </p>

                                <p className="text-xs text-gray-500">
                                  {formatMoney(
                                    player
                                      .contract
                                      .guaranteedValue,
                                  )}{" "}
                                  guaranteed
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 overflow-hidden rounded-md border border-gray-800">
                              <table className="w-full text-xs">
                                <thead className="bg-gray-950 text-gray-500">
                                  <tr>
                                    <th className="px-2 py-2 text-left">
                                      Year
                                    </th>

                                    <th className="px-2 py-2 text-right">
                                      Salary
                                    </th>

                                    <th className="px-2 py-2 text-right">
                                      Bonus
                                    </th>

                                    <th className="px-2 py-2 text-right">
                                      Cap
                                    </th>

                                    <th className="px-2 py-2 text-right">
                                      GTD
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {player.contract.years.map(
                                    (
                                      year,
                                    ) => (
                                      <tr
                                        key={
                                          year.seasonId
                                        }
                                        className="border-t border-gray-800 text-gray-300"
                                      >
                                        <td className="px-2 py-2">
                                          {
                                            year.seasonYear
                                          }
                                        </td>

                                        <td className="px-2 py-2 text-right">
                                          {formatMoney(
                                            year.salary,
                                          )}
                                        </td>

                                        <td className="px-2 py-2 text-right">
                                          {formatMoney(
                                            year.bonus,
                                          )}
                                        </td>

                                        <td className="px-2 py-2 text-right font-medium text-white">
                                          {formatMoney(
                                            year.capHit,
                                          )}
                                        </td>

                                        <td className="px-2 py-2 text-right">
                                          {formatMoney(
                                            year.guaranteedAmount,
                                          )}
                                        </td>
                                      </tr>
                                    ),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </details>
                      ) : (
                        <span className="text-sm text-gray-500">
                          No active contract
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right text-gray-300">
                      {
                        player.rosterSlot
                      }
                    </td>

<td className="px-4 py-3 text-right">
  {player.contract ? (
    (() => {
      const isTagEligible =
  isFranchiseTagWindowOpen &&
  player.contract.endsSeasonId ===
    activeSeason.id;

      return (
        <div className="flex flex-col items-end gap-2">
          {isTagEligible ? (
            <FranchiseTagButton
              leagueId={leagueId}
              contractId={
                player.contract.contractId
              }
              playerName={
                player.playerName
              }
            />
          ) : null}

          <ReleasePlayerButton
            leagueId={leagueId}
            contractId={
              player.contract.contractId
            }
            playerName={
              player.playerName
            }
          />
        </div>
      );
    })()
  ) : (
    <RemoveRosterPlayerButton
      leagueId={leagueId}
      rosterId={player.rosterId}
      playerName={player.playerName}
    />
  )}
</td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}