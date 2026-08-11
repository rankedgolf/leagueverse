"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { submitFreeAgencyOffer } from "@/features/free-agency/actions/submit-free-agency-offer";

type MakeFreeAgentOfferFormProps = {
  leagueId: string;
  leaguePlayerId: string;
  playerName: string;
};

export function MakeFreeAgentOfferForm({
  leagueId,
  leaguePlayerId,
  playerName,
}: MakeFreeAgentOfferFormProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [annualSalary, setAnnualSalary] = useState("1");
  const [contractYears, setContractYears] = useState("1");
  const [guaranteedValue, setGuaranteedValue] = useState("0");
  const [signingBonus, setSigningBonus] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const parsedAnnualSalary = Number(annualSalary);
  const parsedContractYears = Number(contractYears);

  const totalValue = useMemo(() => {
    if (
      !Number.isFinite(parsedAnnualSalary) ||
      !Number.isFinite(parsedContractYears)
    ) {
      return 0;
    }

    return (
      Math.round(
        parsedAnnualSalary * parsedContractYears * 100,
      ) / 100
    );
  }, [parsedAnnualSalary, parsedContractYears]);

  function closeForm() {
    if (isSubmitting) {
      return;
    }

    setIsOpen(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function handleSubmit() {
    const salary = Number(annualSalary);
    const years = Number(contractYears);
    const guaranteed = Number(guaranteedValue);
    const bonus = Number(signingBonus);

    if (!Number.isFinite(salary) || salary <= 0) {
      setErrorMessage("Annual salary must be greater than zero.");
      return;
    }

    if (!Number.isInteger(years) || years < 1) {
      setErrorMessage("Contract years must be at least 1.");
      return;
    }

    if (!Number.isFinite(guaranteed) || guaranteed < 0) {
      setErrorMessage("Guaranteed value cannot be negative.");
      return;
    }

    if (!Number.isFinite(bonus) || bonus < 0) {
      setErrorMessage("Signing bonus cannot be negative.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await submitFreeAgencyOffer({
        leagueId,
        leaguePlayerId,
        annualSalary: salary,
        contractYears: years,
        guaranteedValue: guaranteed,
        signingBonus: bonus,
      });

      setSuccessMessage(
        `Offer submitted by ${result.team.name}.`,
      );

      router.refresh();

      setTimeout(() => {
        setIsOpen(false);
        setSuccessMessage(null);
      }, 1000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit the offer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setErrorMessage(null);
          setSuccessMessage(null);
        }}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
      >
        Make Offer
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  Free Agent Offer
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {playerName}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Build a contract proposal for this player.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <OfferField
                  label="Contract Years"
                  value={contractYears}
                  min="1"
                  step="1"
                  onChange={setContractYears}
                />

                <OfferField
                  label="Annual Salary"
                  value={annualSalary}
                  min="0.01"
                  step="0.01"
                  onChange={setAnnualSalary}
                />

                <OfferField
                  label="Guaranteed Value"
                  value={guaranteedValue}
                  min="0"
                  step="0.01"
                  onChange={setGuaranteedValue}
                />

                <OfferField
                  label="Signing Bonus"
                  value={signingBonus}
                  min="0"
                  step="0.01"
                  onChange={setSigningBonus}
                />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Contract Summary
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <SummaryItem
                    label="Years"
                    value={
                      Number.isFinite(parsedContractYears)
                        ? String(parsedContractYears)
                        : "—"
                    }
                  />
                  <SummaryItem
                    label="Total Value"
                    value={
                      totalValue > 0
                        ? formatMoney(totalValue)
                        : "—"
                    }
                  />
                  <SummaryItem
                    label="Annual Salary"
                    value={
                      parsedAnnualSalary > 0
                        ? formatMoney(parsedAnnualSalary)
                        : "—"
                    }
                  />
                  <SummaryItem
                    label="Guaranteed"
                    value={
                      Number(guaranteedValue) >= 0
                        ? formatMoney(Number(guaranteedValue))
                        : "—"
                    }
                  />
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  LeagueVerse will validate salary-cap space and league rules again before the offer is stored.
                </p>
              </div>

              {errorMessage ? (
                <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/30 p-3 text-sm text-emerald-300">
                  {successMessage}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 p-5">
              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || Boolean(successMessage)}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Submitting Offer..."
                  : "Submit Offer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

type OfferFieldProps = {
  label: string;
  value: string;
  min: string;
  step: string;
  onChange: (value: string) => void;
};

function OfferField({
  label,
  value,
  min,
  step,
  onChange,
}: OfferFieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-600"
      />
    </div>
  );
}

type SummaryItemProps = {
  label: string;
  value: string;
};

function SummaryItem({
  label,
  value,
}: SummaryItemProps) {
  return (
    <div>
      <p className="text-xs text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}