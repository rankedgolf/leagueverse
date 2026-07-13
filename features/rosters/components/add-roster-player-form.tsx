"use client";

import { useState } from "react";
import { createPlayer } from "@/features/players/actions/create-player";
import { addPlayerToRoster } from "@/features/rosters/actions/add-player-to-roster";

type TeamOption = {
  id: string;
  name: string;
};

type AddRosterPlayerFormProps = {
  leagueId: string;
  seasonId: string;
  teams: TeamOption[];
};

export function AddRosterPlayerForm({
  leagueId,
  seasonId,
  teams,
}: AddRosterPlayerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    const firstName = String(formData.get("firstName") || "");
    const lastName = String(formData.get("lastName") || "");
    const position = String(formData.get("position") || "");
    const proTeam = String(formData.get("proTeam") || "");
    const teamId = String(formData.get("teamId") || "");

    const player = await createPlayer({
      leagueId,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`.trim(),
      position,
      proTeam,
      sport: "football",
    });

    await addPlayerToRoster({
      leagueId,
      seasonId,
      teamId,
      playerId: player.id,
      rosterSlot: "active",
    });

    setIsSubmitting(false);
  }

  return (
    <form action={handleSubmit} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h2 className="mb-4 text-lg font-semibold text-white">Add Player</h2>

      <div className="grid gap-3 md:grid-cols-5">
        <input name="firstName" placeholder="First name" required className="rounded bg-slate-950 px-3 py-2 text-white" />
        <input name="lastName" placeholder="Last name" required className="rounded bg-slate-950 px-3 py-2 text-white" />
        <input name="position" placeholder="Position" required className="rounded bg-slate-950 px-3 py-2 text-white" />
        <input name="proTeam" placeholder="Pro team" className="rounded bg-slate-950 px-3 py-2 text-white" />

        <select name="teamId" required className="rounded bg-slate-950 px-3 py-2 text-white">
          <option value="">Fantasy team</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 rounded bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
      >
        {isSubmitting ? "Adding..." : "Add to Roster"}
      </button>
    </form>
  );
}