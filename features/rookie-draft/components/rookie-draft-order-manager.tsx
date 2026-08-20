"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveRookieDraftOrder } from "@/features/rookie-draft/actions/save-rookie-draft-order";

type TeamOption = {
  id: string;
  name: string;
};

type RookieDraftOrderManagerProps = {
  leagueId: string;
  draftSeasonId: string;
  teams: TeamOption[];
};

export function RookieDraftOrderManager({
  leagueId,
  draftSeasonId,
  teams,
}: RookieDraftOrderManagerProps) {
  const router =
    useRouter();

  const [teamOrder, setTeamOrder] =
    useState<string[]>(
      teams.map(
        (team) =>
          team.id,
      ),
    );

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  function moveTeam(
    index: number,
    direction: -1 | 1,
  ) {
    const targetIndex =
      index +
      direction;

    if (
      targetIndex < 0 ||
      targetIndex >=
        teamOrder.length
    ) {
      return;
    }

    const next =
      [...teamOrder];

    const current =
      next[index];

    const target =
      next[targetIndex];

    if (
      !current ||
      !target
    ) {
      return;
    }

    next[index] =
      target;

    next[targetIndex] =
      current;

    setTeamOrder(
      next,
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result =
        await saveRookieDraftOrder({
          leagueId,
          draftSeasonId,
          teamOrder,
        });

      setMessage(
        `Draft order saved. ${result.updatedCount} picks were numbered.`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save rookie draft order.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const teamMap =
    new Map(
      teams.map(
        (team) => [
          team.id,
          team,
        ],
      ),
    );

  return (
    <div className="mt-5 border-t border-slate-800 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Draft Order
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Arrange teams from first overall through the final pick of Round 1. This order will repeat for each round.
      </p>

      <div className="mt-4 space-y-2">
        {teamOrder.map(
          (
            teamId,
            index,
          ) => {
            const team =
              teamMap.get(
                teamId,
              );

            if (!team) {
              return null;
            }

            return (
              <div
                key={teamId}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-sm font-semibold text-white">
                    {index + 1}
                  </span>

                  <p className="font-medium text-white">
                    {team.name}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      moveTeam(
                        index,
                        -1,
                      )
                    }
                    disabled={
                      isSaving ||
                      index === 0
                    }
                    className="rounded border border-slate-700 px-2 py-1 text-sm text-slate-300 disabled:opacity-40"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      moveTeam(
                        index,
                        1,
                      )
                    }
                    disabled={
                      isSaving ||
                      index ===
                        teamOrder.length -
                          1
                    }
                    className="rounded border border-slate-700 px-2 py-1 text-sm text-slate-300 disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>
              </div>
            );
          },
        )}
      </div>

      <button
        type="button"
        onClick={
          handleSave
        }
        disabled={
          isSaving
        }
        className="mt-4 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-50"
      >
        {isSaving
          ? "Saving..."
          : "Save Draft Order"}
      </button>

      {message ? (
        <p className="mt-3 text-sm text-emerald-400">
          {message}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}