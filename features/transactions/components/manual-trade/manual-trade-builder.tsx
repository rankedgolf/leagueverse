"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createManualTrade } from "@/features/transactions/actions/create-manual-trade";

type TeamOption = {
  id: string;
  name: string;
};

type RosterPlayerOption = {
  playerId: string;
  teamId: string;

  firstName: string | null;
  lastName: string | null;

  position: string | null;
  proTeam: string | null;
};

type DraftPickOption = {
  id: string;

  currentTeamId: string;
  originalTeamId: string;

  originalTeamName: string | null;

  seasonId: string;
  seasonYear: number | null;

  round: number;
  pickNumber: number | null;
};

type ManualTradeBuilderProps = {
  leagueId: string;
  seasonId: string;

  teams: TeamOption[];
  rosterPlayers: RosterPlayerOption[];
  draftPicks: DraftPickOption[];
};

function getPlayerName(
  player: RosterPlayerOption,
): string {
  const fullName = [
    player.firstName,
    player.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return fullName || "Unnamed Player";
}

function getDraftPickLabel(
  pick: DraftPickOption,
): string {
  const year =
    pick.seasonYear ?? "Future";

  if (pick.pickNumber) {
    return `${year} Round ${pick.round} · Pick ${pick.pickNumber}`;
  }

  return `${year} Round ${pick.round}`;
}

export function ManualTradeBuilder({
  leagueId,
  seasonId,
  teams,
  rosterPlayers,
  draftPicks,
}: ManualTradeBuilderProps) {
  const router = useRouter();

  const [teamAId, setTeamAId] =
    useState("");

  const [teamBId, setTeamBId] =
    useState("");

  const [
    playerIdsFromTeamA,
    setPlayerIdsFromTeamA,
  ] = useState<string[]>([]);

  const [
    playerIdsFromTeamB,
    setPlayerIdsFromTeamB,
  ] = useState<string[]>([]);

  const [
    draftPickIdsFromTeamA,
    setDraftPickIdsFromTeamA,
  ] = useState<string[]>([]);

  const [
    draftPickIdsFromTeamB,
    setDraftPickIdsFromTeamB,
  ] = useState<string[]>([]);

  const [notes, setNotes] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const playersFromTeamA =
    useMemo(
      () =>
        rosterPlayers
          .filter(
            (player) =>
              player.teamId === teamAId,
          )
          .sort((a, b) =>
            getPlayerName(a).localeCompare(
              getPlayerName(b),
            ),
          ),
      [rosterPlayers, teamAId],
    );

  const playersFromTeamB =
    useMemo(
      () =>
        rosterPlayers
          .filter(
            (player) =>
              player.teamId === teamBId,
          )
          .sort((a, b) =>
            getPlayerName(a).localeCompare(
              getPlayerName(b),
            ),
          ),
      [rosterPlayers, teamBId],
    );

  const draftPicksFromTeamA =
    useMemo(
      () =>
        draftPicks
          .filter(
            (pick) =>
              pick.currentTeamId ===
              teamAId,
          )
          .sort(compareDraftPicks),
      [draftPicks, teamAId],
    );

  const draftPicksFromTeamB =
    useMemo(
      () =>
        draftPicks
          .filter(
            (pick) =>
              pick.currentTeamId ===
              teamBId,
          )
          .sort(compareDraftPicks),
      [draftPicks, teamBId],
    );

  const teamA =
    teams.find(
      (team) => team.id === teamAId,
    ) ?? null;

  const teamB =
    teams.find(
      (team) => team.id === teamBId,
    ) ?? null;

  function handleTeamAChange(
    value: string,
  ) {
    setTeamAId(value);
    setPlayerIdsFromTeamA([]);
    setDraftPickIdsFromTeamA([]);

    if (value === teamBId) {
      setTeamBId("");
      setPlayerIdsFromTeamB([]);
      setDraftPickIdsFromTeamB([]);
    }
  }

  function handleTeamBChange(
    value: string,
  ) {
    setTeamBId(value);
    setPlayerIdsFromTeamB([]);
    setDraftPickIdsFromTeamB([]);

    if (value === teamAId) {
      setTeamAId("");
      setPlayerIdsFromTeamA([]);
      setDraftPickIdsFromTeamA([]);
    }
  }

  function toggleTeamAPlayer(
    playerId: string,
  ) {
    setPlayerIdsFromTeamA((current) =>
      current.includes(playerId)
        ? current.filter(
            (id) => id !== playerId,
          )
        : [...current, playerId],
    );
  }

  function toggleTeamBPlayer(
    playerId: string,
  ) {
    setPlayerIdsFromTeamB((current) =>
      current.includes(playerId)
        ? current.filter(
            (id) => id !== playerId,
          )
        : [...current, playerId],
    );
  }

  function toggleTeamADraftPick(
    draftPickId: string,
  ) {
    setDraftPickIdsFromTeamA(
      (current) =>
        current.includes(draftPickId)
          ? current.filter(
              (id) =>
                id !== draftPickId,
            )
          : [...current, draftPickId],
    );
  }

  function toggleTeamBDraftPick(
    draftPickId: string,
  ) {
    setDraftPickIdsFromTeamB(
      (current) =>
        current.includes(draftPickId)
          ? current.filter(
              (id) =>
                id !== draftPickId,
            )
          : [...current, draftPickId],
    );
  }

  async function handleSubmit() {
    if (!teamAId || !teamBId) {
      setErrorMessage(
        "Select both teams.",
      );

      return;
    }

    const totalAssetCount =
      playerIdsFromTeamA.length +
      playerIdsFromTeamB.length +
      draftPickIdsFromTeamA.length +
      draftPickIdsFromTeamB.length;

    if (totalAssetCount === 0) {
      setErrorMessage(
        "Select at least one player or draft pick.",
      );

      return;
    }

    const confirmed = window.confirm(
      `Create this pending trade?\n\n${
        teamA?.name ?? "Team A"
      } sends ${
        playerIdsFromTeamA.length
      } player${
        playerIdsFromTeamA.length === 1
          ? ""
          : "s"
      } and ${
        draftPickIdsFromTeamA.length
      } pick${
        draftPickIdsFromTeamA.length === 1
          ? ""
          : "s"
      }.\n${
        teamB?.name ?? "Team B"
      } sends ${
        playerIdsFromTeamB.length
      } player${
        playerIdsFromTeamB.length === 1
          ? ""
          : "s"
      } and ${
        draftPickIdsFromTeamB.length
      } pick${
        draftPickIdsFromTeamB.length === 1
          ? ""
          : "s"
      }.\n\nNo league data will change until the trade is approved and applied.`,
    );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const transaction =
        await createManualTrade({
          leagueId,
          seasonId,

          teamAId,
          teamBId,

          playerIdsFromTeamA,
          playerIdsFromTeamB,

          draftPickIdsFromTeamA,
          draftPickIdsFromTeamB,

          notes:
            notes.trim() || null,
        });

      router.push(
        `/leagues/${leagueId}/transactions/${transaction.id}`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create the trade.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const teamASelectedPlayers =
    playersFromTeamA.filter(
      (player) =>
        playerIdsFromTeamA.includes(
          player.playerId,
        ),
    );

  const teamBSelectedPlayers =
    playersFromTeamB.filter(
      (player) =>
        playerIdsFromTeamB.includes(
          player.playerId,
        ),
    );

  const teamASelectedPicks =
    draftPicksFromTeamA.filter(
      (pick) =>
        draftPickIdsFromTeamA.includes(
          pick.id,
        ),
    );

  const teamBSelectedPicks =
    draftPicksFromTeamB.filter(
      (pick) =>
        draftPickIdsFromTeamB.includes(
          pick.id,
        ),
    );

  const hasAssets =
    playerIdsFromTeamA.length > 0 ||
    playerIdsFromTeamB.length > 0 ||
    draftPickIdsFromTeamA.length > 0 ||
    draftPickIdsFromTeamB.length > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">
          Trade Partners
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Select the two franchises involved in the trade.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <TeamSelector
            label="Team A"
            value={teamAId}
            teams={teams.filter(
              (team) =>
                team.id !== teamBId,
            )}
            onChange={
              handleTeamAChange
            }
          />

          <TeamSelector
            label="Team B"
            value={teamBId}
            teams={teams.filter(
              (team) =>
                team.id !== teamAId,
            )}
            onChange={
              handleTeamBChange
            }
          />
        </div>
      </section>

      {teamA && teamB ? (
        <section className="grid gap-5 xl:grid-cols-2">
          <div className="space-y-5">
            <TradeSide
              heading={`${teamA.name} Sends`}
              players={playersFromTeamA}
              selectedIds={
                playerIdsFromTeamA
              }
              onToggle={
                toggleTeamAPlayer
              }
            />

            <DraftPickSide
              heading={`${teamA.name} Draft Picks`}
              picks={draftPicksFromTeamA}
              selectedIds={
                draftPickIdsFromTeamA
              }
              onToggle={
                toggleTeamADraftPick
              }
            />
          </div>

          <div className="space-y-5">
            <TradeSide
              heading={`${teamB.name} Sends`}
              players={playersFromTeamB}
              selectedIds={
                playerIdsFromTeamB
              }
              onToggle={
                toggleTeamBPlayer
              }
            />

            <DraftPickSide
              heading={`${teamB.name} Draft Picks`}
              picks={draftPicksFromTeamB}
              selectedIds={
                draftPickIdsFromTeamB
              }
              onToggle={
                toggleTeamBDraftPick
              }
            />
          </div>
        </section>
      ) : null}

      {teamA && teamB ? (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">
            Trade Summary
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <TradeSummarySide
              teamName={teamA.name}
              players={
                teamASelectedPlayers
              }
              draftPicks={
                teamASelectedPicks
              }
            />

            <TradeSummarySide
              teamName={teamB.name}
              players={
                teamBSelectedPlayers
              }
              draftPicks={
                teamBSelectedPicks
              }
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-white">
              Commissioner Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value,
                )
              }
              rows={3}
              placeholder="Optional trade notes..."
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-600"
            />
          </div>
        </section>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            !teamAId ||
            !teamBId ||
            !hasAssets
          }
          className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Creating Trade..."
            : "Create Pending Trade"}
        </button>
      </div>
    </div>
  );
}

function compareDraftPicks(
  a: DraftPickOption,
  b: DraftPickOption,
): number {
  const yearA =
    a.seasonYear ?? 9999;

  const yearB =
    b.seasonYear ?? 9999;

  if (yearA !== yearB) {
    return yearA - yearB;
  }

  if (a.round !== b.round) {
    return a.round - b.round;
  }

  return (
    (a.pickNumber ?? 9999) -
    (b.pickNumber ?? 9999)
  );
}

type TeamSelectorProps = {
  label: string;
  value: string;
  teams: TeamOption[];
  onChange: (value: string) => void;
};

function TeamSelector({
  label,
  value,
  teams,
  onChange,
}: TeamSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-white">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-600"
      >
        <option value="">
          Select team...
        </option>

        {teams.map((team) => (
          <option
            key={team.id}
            value={team.id}
          >
            {team.name}
          </option>
        ))}
      </select>
    </div>
  );
}

type TradeSideProps = {
  heading: string;
  players: RosterPlayerOption[];
  selectedIds: string[];
  onToggle: (playerId: string) => void;
};

function TradeSide({
  heading,
  players,
  selectedIds,
  onToggle,
}: TradeSideProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-5">
        <h2 className="text-lg font-semibold text-white">
          {heading}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Players · {selectedIds.length} selected
        </p>
      </div>

      <div className="max-h-[520px] divide-y divide-slate-800 overflow-y-auto">
        {players.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">
            No players found on this roster.
          </div>
        ) : (
          players.map((player) => {
            const selected =
              selectedIds.includes(
                player.playerId,
              );

            return (
              <label
                key={player.playerId}
                className={`flex cursor-pointer items-center gap-4 p-4 ${
                  selected
                    ? "bg-emerald-950/20"
                    : "hover:bg-slate-800/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onToggle(
                      player.playerId,
                    )
                  }
                  className="h-4 w-4 accent-emerald-500"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">
                    {getPlayerName(
                      player,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {player.position ??
                      "—"}
                    {player.proTeam
                      ? ` · ${player.proTeam}`
                      : ""}
                  </p>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

type DraftPickSideProps = {
  heading: string;
  picks: DraftPickOption[];
  selectedIds: string[];
  onToggle: (
    draftPickId: string,
  ) => void;
};

function DraftPickSide({
  heading,
  picks,
  selectedIds,
  onToggle,
}: DraftPickSideProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-5">
        <h2 className="text-lg font-semibold text-white">
          {heading}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Picks · {selectedIds.length} selected
        </p>
      </div>

      <div className="divide-y divide-slate-800">
        {picks.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">
            No tradeable draft picks.
          </div>
        ) : (
          picks.map((pick) => {
            const selected =
              selectedIds.includes(
                pick.id,
              );

            return (
              <label
                key={pick.id}
                className={`flex cursor-pointer items-center gap-4 p-4 ${
                  selected
                    ? "bg-emerald-950/20"
                    : "hover:bg-slate-800/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onToggle(pick.id)
                  }
                  className="h-4 w-4 accent-emerald-500"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">
                    {getDraftPickLabel(
                      pick,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Originally:{" "}
                    {pick.originalTeamName ??
                      "Unknown Team"}
                  </p>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

type TradeSummarySideProps = {
  teamName: string;
  players: RosterPlayerOption[];
  draftPicks: DraftPickOption[];
};

function TradeSummarySide({
  teamName,
  players,
  draftPicks,
}: TradeSummarySideProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {teamName} Sends
      </p>

      {players.length === 0 &&
      draftPicks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">
          No assets selected.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {players.map((player) => (
            <div
              key={player.playerId}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
            >
              <p className="text-sm font-medium text-white">
                {getPlayerName(
                  player,
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Player ·{" "}
                {player.position ??
                  "—"}
                {player.proTeam
                  ? ` · ${player.proTeam}`
                  : ""}
              </p>
            </div>
          ))}

          {draftPicks.map((pick) => (
            <div
              key={pick.id}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2"
            >
              <p className="text-sm font-medium text-white">
                {getDraftPickLabel(
                  pick,
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Draft Pick · Originally{" "}
                {pick.originalTeamName ??
                  "Unknown Team"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}