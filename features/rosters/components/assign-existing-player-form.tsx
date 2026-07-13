"use client";

import { useState } from "react";
import { addPlayerToRoster } from "@/features/rosters/actions/add-player-to-roster";

type TeamOption = {
  id: string;
  name: string;
};

type PlayerOption = {
  id: string;
  displayName: string;
  position: string | null;
  proTeam: string | null;
};

type AssignExistingPlayerFormProps = {
  leagueId: string;
  seasonId: string;
  teams: TeamOption[];
  players: PlayerOption[];
};

export function AssignExistingPlayerForm({
  leagueId,
  seasonId,
  teams,
  players,
}: AssignExistingPlayerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const filteredPlayers = players.filter((player) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return [
      player.displayName,
      player.position,
      player.proTeam,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(searchValue));
  });

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    try {
      const playerId = String(formData.get("playerId") || "");
      const teamId = String(formData.get("teamId") || "");
      const rosterSlot = String(formData.get("rosterSlot") || "active");

      await addPlayerToRoster({
        leagueId,
        seasonId,
        playerId,
        teamId,
        rosterSlot,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-lg border border-slate-800 bg-slate-900 p-5"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">
          Assign Existing Player
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Select a player from the LeagueVerse player database.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div>
          <label
            htmlFor="player-search"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Search
          </label>

          <input
            id="player-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, position, or pro team"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-500"
          />
        </div>

        <div>
          <label
            htmlFor="playerId"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Player
          </label>

          <select
            id="playerId"
            name="playerId"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          >
            <option value="">Select player</option>

            {filteredPlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.displayName}
                {player.position ? ` · ${player.position}` : ""}
                {player.proTeam ? ` · ${player.proTeam}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="teamId"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Fantasy Team
          </label>

          <select
            id="teamId"
            name="teamId"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          >
            <option value="">Select team</option>

            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="rosterSlot"
            className="mb-1 block text-sm font-medium text-slate-300"
          >
            Roster Slot
          </label>

          <select
            id="rosterSlot"
            name="rosterSlot"
            defaultValue="active"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          >
            <option value="active">Active</option>
            <option value="bench">Bench</option>
            <option value="injured_reserve">Injured Reserve</option>
            <option value="taxi">Taxi Squad</option>
            <option value="practice_squad">Practice Squad</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || players.length === 0 || teams.length === 0}
        className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Assigning..." : "Assign to Roster"}
      </button>
    </form>
  );
}