import { ContractService } from "@/features/contracts/services/contract-service";
import { ContractImportForm } from "@/features/contracts/components/contract-import-form";

import { LeagueEntitlementService } from "@/features/billing/services/league-entitlement-service";
import { PremiumFeatureLocked } from "@/features/billing/components/premium-feature-locked";

type ContractsPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function ContractsPage({
  params,
}: ContractsPageProps) {
  const { leagueId } = await params;

  const entitlement =
    await LeagueEntitlementService.getStatus(
      leagueId,
    );

  if (!entitlement.isActivated) {
    return (
      <PremiumFeatureLocked
        leagueId={leagueId}
      />
    );
  }

  const contracts =
    await ContractService.getLeagueContracts(
      leagueId,
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Contracts
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Manage player contracts, annual salaries, guarantees, and cap
          commitments.
        </p>
      </div>

      <ContractImportForm
        leagueId={leagueId}
      />

      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">
                Player
              </th>

              <th className="px-4 py-3 text-left">
                Fantasy Team
              </th>

              <th className="px-4 py-3 text-center">
                Type
              </th>

              <th className="px-4 py-3 text-center">
                Term
              </th>

              <th className="px-4 py-3 text-right">
                Current Cap Hit
              </th>

              <th className="px-4 py-3 text-right">
                Total Value
              </th>

              <th className="px-4 py-3 text-right">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  No contracts have been created yet.
                </td>
              </tr>
            ) : (
              contracts.map(
                (contract) => {
                  const currentYear =
                    contract.years[0];

                  const contractLength =
                    contract.years.length;

                  return (
                    <tr
                      key={contract.id}
                      className="border-t border-slate-800"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">
                          {
                            contract.playerName
                          }
                        </div>

                        <div className="text-xs text-slate-500">
                          {[
                            contract.position,
                            contract.proTeam,
                          ]
                            .filter(Boolean)
                            .join(" · ") ||
                            "Player details unavailable"}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-300">
                        {
                          contract.teamName
                        }
                      </td>

                      <td className="px-4 py-3 text-center text-slate-300">
                        {contract.contractType.replaceAll(
                          "_",
                          " ",
                        )}
                      </td>

                      <td className="px-4 py-3 text-center text-slate-300">
                        <div>
                          {
                            contract.startSeasonName
                          }{" "}
                          –{" "}
                          {
                            contract.endSeasonName
                          }
                        </div>

                        <div className="text-xs text-slate-500">
                          {
                            contractLength
                          }{" "}
                          {contractLength ===
                          1
                            ? "year"
                            : "years"}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right text-slate-300">
                        {currentYear
                          ? formatCurrency(
                              currentYear.capHit,
                            )
                          : "—"}
                      </td>

                      <td className="px-4 py-3 text-right text-slate-300">
                        {formatCurrency(
                          contract.totalValue,
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs capitalize text-slate-300">
                          {contract.status.replaceAll(
                            "_",
                            " ",
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                },
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}