"use client";

import { useMemo, useState } from "react";

import { buildSleeperImportPlan } from "@/features/integrations/actions/build-sleeper-import-plan";
import { executeSleeperImport } from "@/features/integrations/actions/execute-sleeper-import";
import { previewSleeperImport } from "@/features/integrations/actions/preview-sleeper-import";
import { saveSleeperContractAssignments } from "@/features/integrations/actions/save-sleeper-contract-assignments";
import { startSleeperImportSession } from "@/features/integrations/actions/start-sleeper-import-session";
import type { SleeperImportExecutionResultDTO } from "@/features/integrations/dto/sleeper-import-execution-dto";
import type { SleeperImportPlanDTO } from "@/features/integrations/dto/sleeper-import-plan-dto";
import type { SleeperImportPreviewDTO } from "@/features/integrations/dto/sleeper-import-preview-dto";
import type {
  ContractYearAssignments,
  ImportSessionDTO,
} from "@/features/integrations/repositories/import-session-repository";
import { validateSleeperImport } from "@/features/integrations/actions/validate-sleeper-import";
import type { SleeperImportValidationDTO } from "@/features/integrations/dto/sleeper-import-validation-dto";

type SleeperImportWizardProps = {
  leagueId: string;
};

type WizardStep = 1 | 2 | 3 | 4 | 5;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function SleeperImportWizard({
  leagueId,
}: SleeperImportWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);

  const [preview, setPreview] =
    useState<SleeperImportPreviewDTO | null>(null);

  const [session, setSession] =
    useState<ImportSessionDTO | null>(null);

  const [validation, setValidation] =
    useState<SleeperImportValidationDTO | null>(null);

  const [importPlan, setImportPlan] =
    useState<SleeperImportPlanDTO | null>(null);

  const [executionResult, setExecutionResult] =
    useState<SleeperImportExecutionResultDTO | null>(null);

  const [assignments, setAssignments] =
    useState<ContractYearAssignments>({});

  const [selectedTeamId, setSelectedTeamId] =
    useState<string>("all");

  const [bulkYears, setBulkYears] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isStartingSession, setIsStartingSession] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] =
    useState(false);

  const [isBuildingPlan, setIsBuildingPlan] =
    useState(false);

  const [isImporting, setIsImporting] =
    useState(false);

  const [saveMessage, setSaveMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const activePreview =
    session?.previewData ?? preview;

  const filteredPlayers = useMemo(() => {
    if (!activePreview) {
      return [];
    }

    if (selectedTeamId === "all") {
      return activePreview.players;
    }

    return activePreview.players.filter(
      (player) =>
        player.sleeperRosterId === selectedTeamId,
    );
  }, [activePreview, selectedTeamId]);

  const teamSummaries = useMemo(() => {
    if (!activePreview) {
      return [];
    }

    return activePreview.teams.map((team) => {
      const teamPlayers = activePreview.players.filter(
        (player) =>
          player.sleeperRosterId ===
          team.sleeperRosterId,
      );

      const contractYearsUsed = teamPlayers.reduce(
        (total, player) =>
          total +
          (assignments[player.sleeperPlayerId] ?? 1),
        0,
      );

      return {
        ...team,
        contractYearsUsed,
      };
    });
  }, [activePreview, assignments]);

  async function handleLoadPreview() {
    setIsLoading(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const result = await previewSleeperImport({
        leagueId,
        defaultContractYears: 1,
      });

      setPreview(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load the Sleeper import preview.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleContinueToContracts() {
    setIsStartingSession(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const result = await startSleeperImportSession({
        leagueId,
      });

      if (!result.previewData) {
        throw new Error(
          "The saved import session does not contain preview data.",
        );
      }

      setSession(result);
      setPreview(result.previewData);
      setAssignments(
        result.contractYearAssignments,
      );
      setStep(2);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start the import session.",
      );
    } finally {
      setIsStartingSession(false);
    }
  }

  function updatePlayerYears(
    playerId: string,
    years: number,
  ) {
    setAssignments((current) => ({
      ...current,
      [playerId]: years,
    }));

    setSaveMessage(null);
  }

  function applyBulkYears() {
    if (!activePreview) {
      return;
    }

    const playersToUpdate =
      selectedTeamId === "all"
        ? activePreview.players
        : activePreview.players.filter(
            (player) =>
              player.sleeperRosterId ===
              selectedTeamId,
          );

    setAssignments((current) => {
      const next = { ...current };

      for (const player of playersToUpdate) {
        next[player.sleeperPlayerId] =
          bulkYears;
      }

      return next;
    });

    setSaveMessage(null);
  }

  async function handleSaveAssignments() {
    if (!session) {
      setErrorMessage(
        "An active import session is required.",
      );

      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const updatedSession =
        await saveSleeperContractAssignments({
          leagueId,
          sessionId: session.id,
          assignments,
          currentStep: 2,
        });

      setSession(updatedSession);
      setAssignments(
        updatedSession.contractYearAssignments,
      );
      setSaveMessage("Contract assignments saved.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save contract assignments.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleContinueToValidation() {
    if (!session) {
      setErrorMessage(
        "An active import session is required.",
      );

      return;
    }

    setIsValidating(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const savedSession =
        await saveSleeperContractAssignments({
          leagueId,
          sessionId: session.id,
          assignments,
          currentStep: 2,
        });

      setSession(savedSession);
      setAssignments(
        savedSession.contractYearAssignments,
      );

      const result = await validateSleeperImport({
        leagueId,
        sessionId: savedSession.id,
      });

      setValidation(result);
      setStep(3);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to validate the Sleeper import.",
      );
    } finally {
      setIsValidating(false);
    }
  }

  async function handleContinueToImport() {
    if (!session || !validation?.isValid) {
      setErrorMessage(
        "The import must pass validation before continuing.",
      );

      return;
    }

    setIsBuildingPlan(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const result = await buildSleeperImportPlan({
        leagueId,
        sessionId: session.id,
      });

      setImportPlan(result);
      setStep(4);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to build the Sleeper import plan.",
      );
    } finally {
      setIsBuildingPlan(false);
    }
  }

  async function handleBeginImport() {
    if (!session || !importPlan?.canImport) {
      setErrorMessage(
        "A valid import plan is required before execution.",
      );

      return;
    }

    const confirmed = window.confirm(
      `Import ${importPlan.playerCount} players and ${importPlan.contractsToCreate} contracts into LeagueVerse?`,
    );

    if (!confirmed) {
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const result = await executeSleeperImport({
        leagueId,
        sessionId: session.id,
      });

      setExecutionResult(result);
      setStep(5);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete the Sleeper league import.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <WizardProgress currentStep={step} />

      {errorMessage ? (
        <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {saveMessage ? (
        <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-3 text-sm text-emerald-300">
          {saveMessage}
        </div>
      ) : null}

      {step === 1 ? (
        <>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Step 1 of 5
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  Review Sleeper League
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Load the connected league and verify teams,
                  rosters, auction salaries, and draft coverage.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoadPreview}
                disabled={isLoading}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading
                  ? "Loading Sleeper Data..."
                  : preview
                    ? "Refresh Preview"
                    : "Load Import Preview"}
              </button>
            </div>
          </section>

          {preview ? (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  label="Teams Found"
                  value={String(preview.teamCount)}
                  detail={preview.leagueName}
                />

                <SummaryCard
                  label="Players Found"
                  value={String(preview.playerCount)}
                  detail={`${preview.validPlayerCount} ready`}
                />

                <SummaryCard
                  label="Auction Prices"
                  value={`${preview.auctionPriceCount} / ${preview.playerCount}`}
                  detail={formatCurrency(
                    preview.auctionTotalSpent,
                  )}
                />

                <SummaryCard
                  label="Warnings"
                  value={String(
                    preview.warningPlayerCount,
                  )}
                  detail={
                    preview.invalidPlayerCount === 0
                      ? "No blocking errors"
                      : `${preview.invalidPlayerCount} blocking errors`
                  }
                  valueClassName={
                    preview.invalidPlayerCount > 0
                      ? "text-red-400"
                      : preview.warningPlayerCount > 0
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }
                />
              </section>

              <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h2 className="text-lg font-semibold text-white">
                  Team Review
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Confirm the Sleeper rosters and auction totals
                  before assigning contract terms.
                </p>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-slate-400">
                      <tr>
                        <th className="px-3 py-3 text-left">
                          Team
                        </th>

                        <th className="px-3 py-3 text-left">
                          Owner
                        </th>

                        <th className="px-3 py-3 text-center">
                          Players
                        </th>

                        <th className="px-3 py-3 text-right">
                          Year 1 Salary
                        </th>

                        <th className="px-3 py-3 text-right">
                          Default Years
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {preview.teams.map((team) => (
                        <tr
                          key={team.sleeperRosterId}
                          className="border-t border-slate-800"
                        >
                          <td className="px-3 py-3 font-medium text-white">
                            {team.teamName}
                          </td>

                          <td className="px-3 py-3 text-slate-300">
                            {team.ownerDisplayName ?? "—"}
                          </td>

                          <td className="px-3 py-3 text-center text-slate-300">
                            {team.playerCount}
                          </td>

                          <td className="px-3 py-3 text-right text-slate-300">
                            {formatCurrency(
                              team.yearOneSalary,
                            )}
                          </td>

                          <td className="px-3 py-3 text-right text-slate-300">
                            {team.contractYearsUsed}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleContinueToContracts}
                  disabled={
                    isStartingSession ||
                    preview.invalidPlayerCount > 0
                  }
                  className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isStartingSession
                    ? "Starting Import Session..."
                    : "Continue to Contract Setup"}
                </button>
              </div>
            </>
          ) : null}
        </>
      ) : null}

      {step === 2 && activePreview && session ? (
        <>
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Step 2 of 5
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  Assign Contract Years
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Every player begins with a one-year
                  contract. Adjust players individually or apply a
                  bulk term to the entire league or one team.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div>
                  <label
                    htmlFor="team-filter"
                    className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    Team
                  </label>

                  <select
                    id="team-filter"
                    value={selectedTeamId}
                    onChange={(event) =>
                      setSelectedTeamId(
                        event.target.value,
                      )
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  >
                    <option value="all">
                      Entire League
                    </option>

                    {activePreview.teams.map((team) => (
                      <option
                        key={team.sleeperRosterId}
                        value={team.sleeperRosterId}
                      >
                        {team.teamName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="bulk-years"
                    className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    Contract Years
                  </label>

                  <select
                    id="bulk-years"
                    value={bulkYears}
                    onChange={(event) =>
                      setBulkYears(
                        Number(event.target.value),
                      )
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  >
                    {[1, 2, 3, 4, 5].map((years) => (
                      <option
                        key={years}
                        value={years}
                      >
                        {years}{" "}
                        {years === 1 ? "year" : "years"}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={applyBulkYears}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                >
                  Apply
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {teamSummaries.map((team) => (
              <div
                key={team.sleeperRosterId}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <p className="font-medium text-white">
                  {team.teamName}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {team.ownerDisplayName ?? "No owner"}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <TeamStat
                    label="Players"
                    value={String(team.playerCount)}
                  />

                  <TeamStat
                    label="Salary"
                    value={formatCurrency(
                      team.yearOneSalary,
                    )}
                  />

                  <TeamStat
                    label="Years"
                    value={String(
                      team.contractYearsUsed,
                    )}
                  />
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-5">
              <h2 className="text-lg font-semibold text-white">
                Player Contracts
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Showing {filteredPlayers.length} of{" "}
                {activePreview.playerCount} players.
              </p>
            </div>

            <div className="divide-y divide-slate-800">
              {filteredPlayers.map((player) => {
                const years =
                  assignments[
                    player.sleeperPlayerId
                  ] ?? 1;

                return (
                  <div
                    key={player.sleeperPlayerId}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {player.playerName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {[
                          player.position,
                          player.proTeam,
                          player.fantasyTeamName,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>

                      <p className="mt-2 text-sm font-medium text-emerald-400">
                        {formatCurrency(
                          player.auctionSalary,
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map(
                        (optionYears) => (
                          <button
                            key={optionYears}
                            type="button"
                            onClick={() =>
                              updatePlayerYears(
                                player.sleeperPlayerId,
                                optionYears,
                              )
                            }
                            className={`h-9 w-9 rounded-full border text-sm font-semibold ${
                              years === optionYears
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                            }`}
                          >
                            {optionYears}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isSaving}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Back to League Review
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleSaveAssignments}
                disabled={isSaving}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={handleContinueToValidation}
                disabled={isSaving || isValidating}
                className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isValidating
                  ? "Validating..."
                  : "Continue to Validation"}
              </button>
            </div>
          </div>
        </>
      ) : null}

      {step === 3 && validation ? (
        <>
          <section
            className={`rounded-xl border p-5 ${
              validation.isValid
                ? "border-emerald-900/60 bg-emerald-950/20"
                : "border-red-900/60 bg-red-950/20"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    validation.isValid
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  Step 3 of 5
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  {validation.isValid
                    ? "Import Ready"
                    : "Import Needs Attention"}
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  {validation.isValid
                    ? "All teams and player contracts passed validation."
                    : "Resolve the blocking issues before importing the league."}
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  validation.isValid
                    ? "border-emerald-800 bg-emerald-950 text-emerald-300"
                    : "border-red-800 bg-red-950 text-red-300"
                }`}
              >
                {validation.isValid
                  ? "Ready"
                  : `${validation.errorCount} errors`}
              </span>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Valid Teams"
              value={`${validation.validTeamCount} / ${validation.teamCount}`}
              detail={`${validation.invalidTeamCount} invalid`}
              valueClassName={
                validation.invalidTeamCount > 0
                  ? "text-red-400"
                  : "text-emerald-400"
              }
            />

            <SummaryCard
              label="Valid Players"
              value={`${validation.validPlayerCount} / ${validation.playerCount}`}
              detail={`${validation.invalidPlayerCount} invalid`}
              valueClassName={
                validation.invalidPlayerCount > 0
                  ? "text-red-400"
                  : "text-emerald-400"
              }
            />

            <SummaryCard
              label="Blocking Errors"
              value={String(validation.errorCount)}
              detail="Must be resolved"
              valueClassName={
                validation.errorCount > 0
                  ? "text-red-400"
                  : "text-emerald-400"
              }
            />

            <SummaryCard
              label="Warnings"
              value={String(validation.warningCount)}
              detail="Review recommended"
              valueClassName={
                validation.warningCount > 0
                  ? "text-amber-400"
                  : "text-emerald-400"
              }
            />
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Team Validation
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Review salary-cap and contract-year usage for each team.
              </p>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="px-3 py-3 text-left">
                      Team
                    </th>

                    <th className="px-3 py-3 text-center">
                      Players
                    </th>

                    <th className="px-3 py-3 text-right">
                      Salary
                    </th>

                    <th className="px-3 py-3 text-right">
                      Cap Space
                    </th>

                    <th className="px-3 py-3 text-center">
                      Contract Years
                    </th>

                    <th className="px-3 py-3 text-center">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {validation.teams.map((team) => (
                    <tr
                      key={team.sleeperRosterId}
                      className="border-t border-slate-800"
                    >
                      <td className="px-3 py-3 font-medium text-white">
                        {team.teamName}
                      </td>

                      <td className="px-3 py-3 text-center text-slate-300">
                        {team.playerCount}
                      </td>

                      <td className="px-3 py-3 text-right text-slate-300">
                        {formatCurrency(team.yearOneSalary)}
                      </td>

                      <td
                        className={`px-3 py-3 text-right font-medium ${
                          team.capSpace < 0
                            ? "text-red-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {formatCurrency(team.capSpace)}
                      </td>

                      <td
                        className={`px-3 py-3 text-center ${
                          team.exceedsContractYears
                            ? "text-red-400"
                            : "text-slate-300"
                        }`}
                      >
                        {team.contractYearsUsed} /{" "}
                        {team.maximumContractYears}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                            team.isValid
                              ? "border-emerald-900/60 bg-emerald-950/40 text-emerald-300"
                              : "border-red-900/60 bg-red-950/40 text-red-300"
                          }`}
                        >
                          {team.isValid ? "Valid" : "Invalid"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {validation.issues.length > 0 ? (
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Validation Issues
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Blocking errors must be resolved. Warnings can be reviewed
                  before continuing.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {validation.issues.map((issue, index) => (
                  <div
                    key={`${issue.code}-${issue.sleeperPlayerId ?? issue.sleeperRosterId ?? index}-${index}`}
                    className={`rounded-lg border p-3 text-sm ${
                      issue.severity === "error"
                        ? "border-red-900/60 bg-red-950/30 text-red-300"
                        : "border-amber-900/60 bg-amber-950/30 text-amber-300"
                    }`}
                  >
                    {issue.message}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Back to Contract Setup
            </button>

            <button
              type="button"
              onClick={handleContinueToImport}
              disabled={
                !validation.isValid ||
                isBuildingPlan
              }
              className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBuildingPlan
                ? "Building Import Plan..."
                : "Continue to Import"}
            </button>
          </div>
        </>
      ) : null}

      {step === 4 && importPlan ? (
        <>
          <section className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  Step 4 of 5
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  Review Import Plan
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  LeagueVerse compared the Sleeper data with the
                  existing league. Review exactly what will be
                  created, reused, moved, or skipped.
                </p>
              </div>

              <span className="rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-300">
                Dry Run Complete
              </span>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Teams"
              value={String(importPlan.teamCount)}
              detail={`${importPlan.teamsToCreate} create · ${importPlan.teamsToReuse} reuse`}
            />

            <SummaryCard
              label="Players"
              value={String(importPlan.playerCount)}
              detail={`${importPlan.playersToCreate} create · ${importPlan.playersToReuse} reuse`}
            />

            <SummaryCard
              label="Roster Changes"
              value={String(
                importPlan.rosterAssignmentsToCreate +
                  importPlan.rosterAssignmentsToMove,
              )}
              detail={`${importPlan.rosterAssignmentsAlreadyCorrect} already correct`}
            />

            <SummaryCard
              label="Contracts"
              value={String(importPlan.contractsToCreate)}
              detail={`${importPlan.contractsToSkip} existing contracts skipped`}
              valueClassName={
                importPlan.contractsToSkip > 0
                  ? "text-amber-400"
                  : "text-emerald-400"
              }
            />
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Import Actions
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Nothing has been written yet. This is the exact
                execution plan LeagueVerse will follow.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <PlanCard
                label="Teams to Create"
                value={importPlan.teamsToCreate}
              />

              <PlanCard
                label="Teams to Reuse"
                value={importPlan.teamsToReuse}
              />

              <PlanCard
                label="Players to Create"
                value={importPlan.playersToCreate}
              />

              <PlanCard
                label="Players to Reuse"
                value={importPlan.playersToReuse}
              />

              <PlanCard
                label="League Players to Create"
                value={importPlan.leaguePlayersToCreate}
              />

              <PlanCard
                label="League Players to Reuse"
                value={importPlan.leaguePlayersToReuse}
              />

              <PlanCard
                label="Roster Assignments"
                value={importPlan.rosterAssignmentsToCreate}
              />

              <PlanCard
                label="Roster Moves"
                value={importPlan.rosterAssignmentsToMove}
              />

              <PlanCard
                label="Contracts to Create"
                value={importPlan.contractsToCreate}
              />
            </div>
          </section>

          {importPlan.warningCount > 0 ? (
            <section className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-5">
              <h2 className="text-lg font-semibold text-amber-300">
                Import Warnings
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                {importPlan.warningCount} warning
                {importPlan.warningCount === 1 ? "" : "s"} found.
                Existing active contracts will not be overwritten.
              </p>

              <div className="mt-4 space-y-3">
                {importPlan.players
                  .filter(
                    (player) =>
                      player.warnings.length > 0,
                  )
                  .flatMap((player) =>
                    player.warnings.map(
                      (warning, index) => (
                        <div
                          key={`${player.sleeperPlayerId}-${index}`}
                          className="rounded-lg border border-amber-900/60 bg-amber-950/30 p-3 text-sm text-amber-300"
                        >
                          {warning}
                        </div>
                      ),
                    ),
                  )}
              </div>
            </section>
          ) : null}

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Team Mapping
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Review which Sleeper teams will be created or
                matched to existing LeagueVerse teams.
              </p>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="px-3 py-3 text-left">
                      Sleeper Team
                    </th>

                    <th className="px-3 py-3 text-center">
                      Action
                    </th>

                    <th className="px-3 py-3 text-left">
                      Existing Team ID
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {importPlan.teams.map((team) => (
                    <tr
                      key={team.sleeperRosterId}
                      className="border-t border-slate-800"
                    >
                      <td className="px-3 py-3 font-medium text-white">
                        {team.teamName}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                            team.action === "create"
                              ? "border-emerald-900/60 bg-emerald-950/40 text-emerald-300"
                              : "border-blue-900/60 bg-blue-950/40 text-blue-300"
                          }`}
                        >
                          {team.action === "create"
                            ? "Create"
                            : "Reuse"}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-slate-400">
                        {team.existingTeamId ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Back to Validation
            </button>

            <button
              type="button"
              onClick={handleBeginImport}
              disabled={
                !importPlan.canImport ||
                isImporting
              }
              className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isImporting
                ? "Importing League..."
                : "Begin League Import"}
            </button>
          </div>
        </>
      ) : null}


      {step === 5 && executionResult ? (
        <>
          <section className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  Step 5 of 5
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Sleeper Import Complete
                </h2>

                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Teams, players, roster assignments, contracts, and
                  contract-year salaries are now available throughout
                  LeagueVerse.
                </p>
              </div>

              <span className="rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-300">
                Completed
              </span>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Teams"
              value={String(
                executionResult.teamsCreated +
                  executionResult.teamsReused,
              )}
              detail={`${executionResult.teamsCreated} created · ${executionResult.teamsReused} reused`}
              valueClassName="text-emerald-400"
            />

            <SummaryCard
              label="Players"
              value={String(
                executionResult.playersCreated +
                  executionResult.playersReused,
              )}
              detail={`${executionResult.playersCreated} created · ${executionResult.playersReused} reused`}
              valueClassName="text-emerald-400"
            />

            <SummaryCard
              label="Contracts"
              value={String(
                executionResult.contractsCreated,
              )}
              detail={`${executionResult.contractsSkipped} skipped`}
              valueClassName="text-emerald-400"
            />

            <SummaryCard
              label="Contract Years"
              value={String(
                executionResult.contractYearsCreated,
              )}
              detail="Salary rows created"
              valueClassName="text-emerald-400"
            />
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-white">
              Import Report
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <PlanCard
                label="League Players Created"
                value={executionResult.leaguePlayersCreated}
              />

              <PlanCard
                label="League Players Reused"
                value={executionResult.leaguePlayersReused}
              />

              <PlanCard
                label="Roster Assignments"
                value={executionResult.rosterAssignmentsCreated}
              />

              <PlanCard
                label="Roster Team Updates"
                value={executionResult.rosterAssignmentsUpdated}
              />

              <PlanCard
                label="Contracts Created"
                value={executionResult.contractsCreated}
              />

              <PlanCard
                label="Contracts Skipped"
                value={executionResult.contractsSkipped}
              />
            </div>
          </section>

          {executionResult.warnings.length > 0 ? (
            <section className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-5">
              <h2 className="text-lg font-semibold text-amber-300">
                Import Warnings
              </h2>

              <div className="mt-4 space-y-3">
                {executionResult.warnings.map(
                  (warning, index) => (
                    <div
                      key={`${warning}-${index}`}
                      className="rounded-lg border border-amber-900/60 bg-amber-950/30 p-3 text-sm text-amber-300"
                    >
                      {warning}
                    </div>
                  ),
                )}
              </div>
            </section>
          ) : null}

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-white">
              Review Your Imported League
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Open each area to confirm the imported roster and
              contract data.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <a
                href={`/leagues/${leagueId}/players`}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
              >
                View Players
              </a>

              <a
                href={`/leagues/${leagueId}/rosters`}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
              >
                View Rosters
              </a>

              <a
                href={`/leagues/${leagueId}/contracts`}
                className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800"
              >
                View Contracts
              </a>

              <a
                href={`/leagues/${leagueId}/salary-cap`}
                className="rounded-lg bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-600"
              >
                View Salary Cap
              </a>
            </div>
          </section>
        </>
      ) : null}

    </div>
  );
}

type WizardProgressProps = {
  currentStep: WizardStep;
};

function WizardProgress({
  currentStep,
}: WizardProgressProps) {
  const steps = [
    "Review League",
    "Assign Contracts",
    "Validate",
    "Import",
    "Complete",
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex min-w-[620px] items-center">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isActive =
            currentStep === stepNumber;
          const isComplete =
            currentStep > stepNumber;

          return (
            <div
              key={label}
              className="flex flex-1 items-center"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    isActive
                      ? "bg-emerald-500 text-white"
                      : isComplete
                        ? "bg-emerald-950 text-emerald-300"
                        : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isComplete ? "✓" : stepNumber}
                </span>

                <span
                  className={`whitespace-nowrap text-sm ${
                    isActive
                      ? "font-medium text-white"
                      : "text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </div>

              {index < steps.length - 1 ? (
                <div className="mx-3 h-px flex-1 bg-slate-800" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
};

function SummaryCard({
  label,
  value,
  detail,
  valueClassName = "text-white",
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}


type PlanCardProps = {
  label: string;
  value: number;
};

function PlanCard({
  label,
  value,
}: PlanCardProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

type TeamStatProps = {
  label: string;
  value: string;
};

function TeamStat({
  label,
  value,
}: TeamStatProps) {
  return (
    <div>
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-white">
        {value}
      </p>
    </div>
  );
}