import { ContractExpirationPreviewService } from "@/features/contract-expirations/services/contract-expiration-preview-service";
import { ProcessContractExpirationsButton } from "@/features/contract-expirations/components/process-contract-expirations-button";

type ContractExpirationPreviewProps = {
  leagueId: string;
};

export async function ContractExpirationPreview({
  leagueId,
}: ContractExpirationPreviewProps) {
  const preview =
    await ContractExpirationPreviewService.getPreview({
      leagueId,
    });

  return (
    <div className="mt-5 border-t border-slate-800 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Expiration Preview
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <InfoCard
          label="Expiring"
          value={String(
            preview.totalExpiring,
          )}
        />

        <InfoCard
          label="Franchise Tagged"
          value={String(
            preview.totalTagged,
          )}
        />

        <InfoCard
          label="Entering Free Agency"
          value={String(
            preview.totalEnteringFreeAgency,
          )}
        />
      </div>

      {preview.players.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No contracts expire after {preview.seasonName}.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {preview.players.map(
            (player) => (
              <div
                key={player.contractId}
                className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">
                    {player.playerName}
                  </p>

                  <p className="text-xs text-slate-500">
                    {player.teamName}
                    {player.position
                      ? ` · ${player.position}`
                      : ""}
                    {player.proTeam
                      ? ` · ${player.proTeam}`
                      : ""}
                  </p>
                </div>

                {player.outcome ===
                "franchise_tag" ? (
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-violet-300">
                      Franchise Tag
                    </p>

                    <p className="text-xs text-slate-400">
                      {player.tagSeasonName} · $
                      {player.tagCapHit}
                    </p>
                  </div>
                ) : (
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-emerald-300">
                      Free Agency
                    </p>

                    <p className="text-xs text-slate-400">
                      Contract expires after{" "}
                      {preview.seasonName}
                    </p>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      )}

    <ProcessContractExpirationsButton
  leagueId={leagueId}
  seasonId={preview.seasonId}
  expiringCount={preview.totalExpiring}
  taggedCount={preview.totalTagged}
  freeAgentCount={
    preview.totalEnteringFreeAgency
  }
/>
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}