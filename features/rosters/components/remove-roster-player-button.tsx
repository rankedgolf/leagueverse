"use client";

import { useState } from "react";
import { removePlayerFromRoster } from "@/features/rosters/actions/remove-player-from-roster";

type RemoveRosterPlayerButtonProps = {
  leagueId: string;
  rosterId: string;
  playerName: string;
};

export function RemoveRosterPlayerButton({
  leagueId,
  rosterId,
  playerName,
}: RemoveRosterPlayerButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    const confirmed = window.confirm(
      `Remove ${playerName} from this roster?`
    );

    if (!confirmed) {
      return;
    }

    setIsRemoving(true);

    try {
      await removePlayerFromRoster({
        leagueId,
        rosterId,
      });
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isRemoving}
      className="text-sm font-medium text-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isRemoving ? "Removing..." : "Remove"}
    </button>
  );
}