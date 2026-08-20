"use client";

import {
  useActionState,
  useState,
} from "react";

import {
  parseWorkbookAction,
  type ManualImportState,
} from "@/features/manual-import/actions/parse-workbook";

import {
  confirmManualImport,
  type ConfirmManualImportResult,
} from "@/features/manual-import/actions/confirm-manual-import";

type ManualImportUploadProps = {
  leagueId: string;
};

const initialState: ManualImportState = {
  success: false,
  message: "",
  preview: null,
};

export function ManualImportUpload({
  leagueId,
}: ManualImportUploadProps) {
  const [
    state,
    formAction,
    pending,
  ] = useActionState(
    parseWorkbookAction,
    initialState,
  );

  const [
    isImporting,
    setIsImporting,
  ] = useState(false);

  const [
    importResult,
    setImportResult,
  ] =
    useState<ConfirmManualImportResult | null>(
      null,
    );

  const [
    importError,
    setImportError,
  ] =
    useState<string | null>(
      null,
    );

  async function handleImport() {
    if (
      !state.preview ||
      !state.preview.playerMatching.canImport
    ) {
      return;
    }

    setIsImporting(
      true,
    );

    setImportResult(
      null,
    );

    setImportError(
      null,
    );

    try {
      const result =
        await confirmManualImport({
          leagueId,

          workbook:
            state.preview.workbook,
        });

      setImportResult(
        result,
      );
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "The league could not be imported.",
      );
    } finally {
      setIsImporting(
        false,
      );
    }
  }

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="space-y-5"
      >
        <input
          type="hidden"
          name="leagueId"
          value={leagueId}
        />

        <div>
          <label
            htmlFor="workbook"
            className="text-sm font-semibold text-white"
          >
            LeagueVerse Workbook
          </label>

          <p className="mt-1 text-xs text-slate-500">
            Upload the completed .xlsx template.
          </p>

          <input
            id="workbook"
            type="file"
            name="workbook"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            required
            className="mt-4 block w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-violet-700 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-violet-600"
          />
        </div>

        <button
          type="submit"
          disabled={
            pending ||
            isImporting
          }
          className="rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending
            ? "Reading Workbook..."
            : "Upload & Preview"}
        </button>
      </form>

      {state.message ? (
        <div
          className={`rounded-xl border p-4 text-sm ${
            state.success
              ? "border-emerald-800 bg-emerald-950/20 text-emerald-300"
              : "border-red-900 bg-red-950/20 text-red-300"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      {state.preview ? (
        <WorkbookPreview
          preview={
            state.preview
          }
          isImporting={
            isImporting
          }
          importResult={
            importResult
          }
          importError={
            importError
          }
          onImport={
            handleImport
          }
        />
      ) : null}
    </div>
  );
}

function WorkbookPreview({
  preview,
  isImporting,
  importResult,
  importError,
  onImport,
}: {
  preview: NonNullable<
    ManualImportState["preview"]
  >;

  isImporting: boolean;

  importResult:
    | ConfirmManualImportResult
    | null;

  importError:
    | string
    | null;

  onImport: () => void;
}) {
  const workbook =
    preview.workbook;

  const playerMatching =
    preview.playerMatching;

  const displayedTeams =
    workbook.teams.slice(
      0,
      10,
    );

  const displayedRosters =
    workbook.rosters.slice(
      0,
      10,
    );

  const problemMatches =
    playerMatching.matches.filter(
      (match) =>
        match.status !==
        "matched",
    );

  return (
    <div className="space-y-8 border-t border-slate-800 pt-6">
      {/* WORKBOOK HEADER */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Workbook Preview
        </p>

        <h3 className="mt-2 text-xl font-bold text-white">
          {
            workbook.fileName
          }
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Nothing has been imported yet.
        </p>
      </div>

      {/* WORKBOOK COUNTS */}
      <div>
        <h4 className="font-semibold text-white">
          Workbook Summary
        </h4>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PreviewCard
            label="Teams"
            value={
              workbook.counts
                .teams
            }
          />

          <PreviewCard
            label="Roster Players"
            value={
              workbook.counts
                .rosters
            }
          />

          <PreviewCard
            label="Contracts"
            value={
              workbook.counts
                .contracts
            }
          />

          <PreviewCard
            label="Draft Picks"
            value={
              workbook.counts
                .draftPicks
            }
          />
        </div>
      </div>

      {/* PLAYER MATCHING */}
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Player Matching
            </p>

            <h4 className="mt-2 text-xl font-bold text-white">
              LeagueVerse Player Database
            </h4>
          </div>

          <p className="text-sm text-slate-500">
            {
              playerMatching.total
            }{" "}
            roster players checked
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PreviewCard
            label="Matched"
            value={
              playerMatching.matched
            }
            valueClassName="text-emerald-400"
          />

          <PreviewCard
            label="Ambiguous"
            value={
              playerMatching.ambiguous
            }
            valueClassName={
              playerMatching.ambiguous >
              0
                ? "text-amber-400"
                : "text-white"
            }
          />

          <PreviewCard
            label="Unmatched"
            value={
              playerMatching.unmatched
            }
            valueClassName={
              playerMatching.unmatched >
              0
                ? "text-red-400"
                : "text-white"
            }
          />

          <div
            className={`rounded-xl border p-5 ${
              playerMatching.canImport
                ? "border-emerald-800 bg-emerald-950/20"
                : "border-red-900 bg-red-950/20"
            }`}
          >
            <p className="text-sm text-slate-400">
              Import Status
            </p>

            <p
              className={`mt-2 text-lg font-bold ${
                playerMatching.canImport
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              {playerMatching.canImport
                ? "Ready"
                : "Blocked"}
            </p>
          </div>
        </div>
      </div>

      {/* PLAYER MATCH PROBLEMS */}
      {problemMatches.length >
      0 ? (
        <div className="rounded-xl border border-amber-800 bg-amber-950/20 p-5">
          <p className="font-semibold text-amber-300">
            Player Review Required
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Every roster player must match a LeagueVerse player before
            the league can be imported.
          </p>

          <div className="mt-4 overflow-hidden rounded-xl border border-amber-900/60">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">
                    Imported Player
                  </th>

                  <th className="px-4 py-3 text-left">
                    Fantasy Team
                  </th>

                  <th className="px-4 py-3 text-left">
                    Position
                  </th>

                  <th className="px-4 py-3 text-left">
                    NFL Team
                  </th>

                  <th className="px-4 py-3 text-left">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {problemMatches.map(
                  (
                    match,
                    index,
                  ) => (
                    <tr
                      key={`${match.importedPlayerName}-${match.teamName}-${index}`}
                      className="border-t border-slate-800"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {
                          match.importedPlayerName
                        }
                      </td>

                      <td className="px-4 py-3 text-slate-300">
                        {
                          match.teamName
                        }
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {match.importedPosition ??
                          "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {match.importedNflTeam ??
                          "—"}
                      </td>

                      <td className="px-4 py-3">
                        {match.status ===
                        "ambiguous" ? (
                          <span className="rounded-full border border-amber-800 bg-amber-950/30 px-2 py-1 text-xs font-semibold text-amber-300">
                            Ambiguous
                          </span>
                        ) : (
                          <span className="rounded-full border border-red-900 bg-red-950/30 px-2 py-1 text-xs font-semibold text-red-300">
                            Unmatched
                          </span>
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 p-5">
          <p className="font-semibold text-emerald-300">
            ✓ All roster players matched LeagueVerse.
          </p>

          <p className="mt-2 text-sm text-slate-400">
            No ambiguous or unmatched player names were detected.
          </p>
        </div>
      )}

      {/* WORKBOOK WARNINGS */}
      {workbook.warnings.length >
      0 ? (
        <div className="rounded-xl border border-amber-800 bg-amber-950/20 p-5">
          <p className="font-semibold text-amber-300">
            Workbook Review Required
          </p>

          <div className="mt-3 space-y-2 text-sm text-amber-200/80">
            {workbook.warnings.map(
              (
                warning,
                index,
              ) => (
                <p
                  key={`${warning}-${index}`}
                >
                  • {warning}
                </p>
              ),
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 p-5">
          <p className="font-semibold text-emerald-300">
            ✓ Basic workbook validation passed.
          </p>
        </div>
      )}

      {/* TEAM PREVIEW */}
      {displayedTeams.length >
      0 ? (
        <div>
          <h4 className="font-semibold text-white">
            Team Preview
          </h4>

          <div className="mt-3 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">
                    Team
                  </th>

                  <th className="px-4 py-3 text-left">
                    Owner
                  </th>

                  <th className="px-4 py-3 text-left">
                    Email
                  </th>

                  <th className="px-4 py-3 text-left">
                    Abbreviation
                  </th>
                </tr>
              </thead>

              <tbody>
                {displayedTeams.map(
                  (
                    team,
                    index,
                  ) => (
                    <tr
                      key={`${team.teamName}-${index}`}
                      className="border-t border-slate-800"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {
                          team.teamName
                        }
                      </td>

                      <td className="px-4 py-3 text-slate-300">
                        {team.ownerDisplayName ??
                          "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {team.ownerEmail ??
                          "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {team.abbreviation ??
                          "—"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {workbook.teams.length >
          10 ? (
            <p className="mt-2 text-xs text-slate-500">
              Showing the first 10 of{" "}
              {
                workbook.teams
                  .length
              }{" "}
              teams.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* ROSTER PREVIEW */}
      {displayedRosters.length >
      0 ? (
        <div>
          <h4 className="font-semibold text-white">
            Roster Preview
          </h4>

          <div className="mt-3 overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">
                    Team
                  </th>

                  <th className="px-4 py-3 text-left">
                    Player
                  </th>

                  <th className="px-4 py-3 text-left">
                    Position
                  </th>

                  <th className="px-4 py-3 text-left">
                    NFL Team
                  </th>

                  <th className="px-4 py-3 text-left">
                    Match
                  </th>
                </tr>
              </thead>

              <tbody>
                {displayedRosters.map(
                  (
                    player,
                    index,
                  ) => {
                    const match =
                      playerMatching.matches.find(
                        (
                          candidate,
                        ) =>
                          candidate.teamName ===
                            player.teamName &&
                          candidate.importedPlayerName ===
                            player.playerName,
                      );

                    return (
                      <tr
                        key={`${player.teamName}-${player.playerName}-${index}`}
                        className="border-t border-slate-800"
                      >
                        <td className="px-4 py-3 text-slate-300">
                          {
                            player.teamName
                          }
                        </td>

                        <td className="px-4 py-3 font-medium text-white">
                          {
                            player.playerName
                          }
                        </td>

                        <td className="px-4 py-3 text-slate-400">
                          {player.position ??
                            "—"}
                        </td>

                        <td className="px-4 py-3 text-slate-400">
                          {player.nflTeam ??
                            "—"}
                        </td>

                        <td className="px-4 py-3">
                          {match?.status ===
                          "matched" ? (
                            <span className="rounded-full border border-emerald-800 bg-emerald-950/30 px-2 py-1 text-xs font-semibold text-emerald-300">
                              Matched
                            </span>
                          ) : match?.status ===
                            "ambiguous" ? (
                            <span className="rounded-full border border-amber-800 bg-amber-950/30 px-2 py-1 text-xs font-semibold text-amber-300">
                              Ambiguous
                            </span>
                          ) : (
                            <span className="rounded-full border border-red-900 bg-red-950/30 px-2 py-1 text-xs font-semibold text-red-300">
                              Unmatched
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Showing the first{" "}
            {Math.min(
              workbook.rosters
                .length,
              10,
            )}{" "}
            of{" "}
            {
              workbook.rosters
                .length
            }{" "}
            roster rows.
          </p>
        </div>
      ) : null}

      {/* FINAL IMPORT */}
      {playerMatching.canImport ? (
        <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Ready to Import
          </p>

          <h4 className="mt-2 text-2xl font-bold text-white">
            Import This League Into LeagueVerse
          </h4>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Player matching and workbook validation passed. The final
            import will create or match teams, assign roster players,
            import contracts, and migrate future draft picks.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <PreviewCard
              label="Teams"
              value={
                workbook.counts
                  .teams
              }
            />

            <PreviewCard
              label="Roster Players"
              value={
                workbook.counts
                  .rosters
              }
            />

            <PreviewCard
              label="Contracts"
              value={
                workbook.counts
                  .contracts
              }
            />

            <PreviewCard
              label="Future Draft Picks"
              value={
                workbook.counts
                  .draftPicks
              }
            />
          </div>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-semibold text-white">
              Before continuing
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              The league must have an active LeagueVerse pass. The
              import is designed to be retry-safe, but you should still
              review the workbook carefully before continuing.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onImport
            }
            disabled={
              isImporting ||
              Boolean(
                importResult,
              )
            }
            className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isImporting
              ? "Importing League..."
              : importResult
                ? "League Imported"
                : "Import Into LeagueVerse"}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm font-semibold text-white">
            Import Blocked
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Correct the unmatched or ambiguous players in the workbook
            and upload it again before continuing.
          </p>
        </div>
      )}

      {/* IMPORT ERROR */}
      {importError ? (
        <div className="rounded-xl border border-red-900 bg-red-950/20 p-5">
          <p className="font-semibold text-red-300">
            Import Failed
          </p>

          <p className="mt-2 text-sm text-red-200">
            {importError}
          </p>
        </div>
      ) : null}

      {/* IMPORT RESULT */}
      {importResult ? (
        <div className="rounded-2xl border border-emerald-800 bg-emerald-950/20 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Import Complete
          </p>

          <h4 className="mt-2 text-2xl font-bold text-white">
            League Imported Successfully
          </h4>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PreviewCard
              label="Teams Created"
              value={
                importResult.createdTeams
              }
            />

            <PreviewCard
              label="Existing Teams"
              value={
                importResult.existingTeams
              }
            />

            <PreviewCard
              label="Roster Players"
              value={
                importResult.rosterPlayers
              }
            />

            <PreviewCard
              label="League Players Created"
              value={
                importResult.createdLeaguePlayers
              }
            />

            <PreviewCard
              label="Roster Entries Created"
              value={
                importResult.createdRosterEntries
              }
            />

            <PreviewCard
              label="Roster Entries Updated"
              value={
                importResult.updatedRosterEntries
              }
            />

            <PreviewCard
              label="Contracts Created"
              value={
                importResult.contractsCreated
              }
            />

            <PreviewCard
              label="Contracts Updated"
              value={
                importResult.contractsUpdated
              }
            />

            <PreviewCard
              label="Draft Picks"
              value={
                importResult.draftPicksCreatedOrUpdated
              }
            />
          </div>

          <p className="mt-6 text-sm text-emerald-200">
            Your LeagueVerse league now contains the imported workbook
            data.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function PreviewCard({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}