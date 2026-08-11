"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { updateFreeAgencyOffer } from "@/features/free-agency/actions/update-free-agency-offer";
import { withdrawFreeAgencyOffer } from "@/features/free-agency/actions/withdraw-free-agency-offer";

export type MyFreeAgencyOffer = {
  id: string;
  leaguePlayerId: string;
  playerName: string;
  position: string | null;
  proTeam: string | null;
  contractYears: number;
  annualSalary: number;
  guaranteedValue: number;
  signingBonus: number;
  totalValue: number;
  submittedAt: string;
};

type MyFreeAgencyOffersProps = {
  leagueId: string;
  teamName: string | null;
  offers: MyFreeAgencyOffer[];
};

export function MyFreeAgencyOffers({
  leagueId,
  teamName,
  offers,
}: MyFreeAgencyOffersProps) {
  if (!teamName) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">
          My Offers
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Active offers submitted by {teamName}. Edit or withdraw them while Free Agency remains open.
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          You do not have any active offers.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              leagueId={leagueId}
              offer={offer}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function OfferCard({
  leagueId,
  offer,
}: {
  leagueId: string;
  offer: MyFreeAgencyOffer;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const [annualSalary, setAnnualSalary] =
    useState(String(offer.annualSalary));
  const [contractYears, setContractYears] =
    useState(String(offer.contractYears));
  const [guaranteedValue, setGuaranteedValue] =
    useState(String(offer.guaranteedValue));
  const [signingBonus, setSigningBonus] =
    useState(String(offer.signingBonus));

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateFreeAgencyOffer({
        leagueId,
        offerId: offer.id,
        annualSalary: Number(annualSalary),
        contractYears: Number(contractYears),
        guaranteedValue: Number(guaranteedValue),
        signingBonus: Number(signingBonus),
      });

      setIsEditing(false);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the offer.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleWithdraw() {
    if (
      !window.confirm(
        `Withdraw your offer for ${offer.playerName}?`,
      )
    ) {
      return;
    }

    setIsWithdrawing(true);
    setErrorMessage(null);

    try {
      await withdrawFreeAgencyOffer({
        leagueId,
        offerId: offer.id,
      });

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to withdraw the offer.",
      );
    } finally {
      setIsWithdrawing(false);
    }
  }

  const previewTotal =
    Number(annualSalary) *
      Number(contractYears) +
    Number(signingBonus);

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">
            {offer.playerName}
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            {offer.position ?? "—"}
            {offer.proTeam ? ` · ${offer.proTeam}` : ""}
          </p>
        </div>

        <span className="rounded-full border border-emerald-900/60 bg-emerald-950/30 px-2 py-1 text-xs font-medium text-emerald-300">
          Active
        </span>
      </div>

      {isEditing ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field label="Years" value={contractYears} onChange={setContractYears} step="1" />
          <Field label="Annual Salary" value={annualSalary} onChange={setAnnualSalary} />
          <Field label="Guaranteed" value={guaranteedValue} onChange={setGuaranteedValue} />
          <Field label="Signing Bonus" value={signingBonus} onChange={setSigningBonus} />

          <div className="sm:col-span-2 rounded-lg border border-slate-800 bg-slate-950 p-3">
            <p className="text-xs text-slate-500">Updated Total Value</p>
            <p className="mt-1 font-semibold text-white">
              {formatMoney(Number.isFinite(previewTotal) ? previewTotal : 0)}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Summary label="Contract" value={`${offer.contractYears} yr${offer.contractYears === 1 ? "" : "s"}`} />
          <Summary label="Annual" value={formatMoney(offer.annualSalary)} />
          <Summary label="Guaranteed" value={formatMoney(offer.guaranteedValue)} />
          <Summary label="Signing Bonus" value={formatMoney(offer.signingBonus)} />
          <div className="col-span-2">
            <Summary label="Total Value" value={formatMoney(offer.totalValue)} />
          </div>
        </div>
      )}

      {errorMessage ? (
        <p className="mt-4 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Offer"}
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Edit Offer
          </button>
        )}

        <button
          type="button"
          onClick={handleWithdraw}
          disabled={isWithdrawing || isSaving}
          className="rounded-lg border border-red-900/60 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/30 disabled:opacity-50"
        >
          {isWithdrawing ? "Withdrawing..." : "Withdraw"}
        </button>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  step = "0.01",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  step?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-600"
      />
    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
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