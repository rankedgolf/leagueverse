import { DemoLeagueService } from "@/features/demo/services/demo-league-service";
import { ContractRepository } from "@/features/contracts/repositories/contract-repository";

export default async function DemoContractsPage() {
  const leagueId = DemoLeagueService.getLeagueId();

  const contracts =
    await ContractRepository.getByLeague(
      leagueId,
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Contracts
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Player Contracts
        </h1>

        <p className="mt-3 max-w-3xl text-slate-400">
          Explore how contracts, guarantees,
          and long-term roster construction
          shape each franchise.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-4 text-left">
                Player
              </th>

              <th className="px-4 py-4 text-left">
                Team
              </th>

              <th className="px-4 py-4 text-left">
                Pos
              </th>

              <th className="px-4 py-4 text-left">
                Contract
              </th>

              <th className="px-4 py-4 text-left">
                Years
              </th>

              <th className="px-4 py-4 text-left">
                Total
              </th>

              <th className="px-4 py-4 text-left">
                Guaranteed
              </th>
            </tr>
          </thead>

          <tbody>
            {contracts.map((contract) => {
              const team = Array.isArray(
                contract.teams,
              )
                ? contract.teams[0]
                : contract.teams;

              const leaguePlayer =
                Array.isArray(
                  contract.league_players,
                )
                  ? contract
                      .league_players[0]
                  : contract
                      .league_players;

              const player =
                Array.isArray(
                  leaguePlayer?.players,
                )
                  ? leaguePlayer
                      ?.players[0]
                  : leaguePlayer?.players;

              const years =
                contract.contract_years
                  ?.length ?? 0;

              return (
                <tr
                  key={contract.id}
                  className="border-t border-slate-800"
                >
                  <td className="px-4 py-4 font-semibold text-white">
                    {player?.display_name ??
                      "Unknown"}
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {team?.name ??
                      "Unknown"}
                  </td>

                  <td className="px-4 py-4 text-slate-400">
                    {player?.position ??
                      "—"}
                  </td>

                  <td className="px-4 py-4 text-slate-400">
                    {contract.contract_type}
                  </td>

                  <td className="px-4 py-4 text-slate-400">
                    {years}
                  </td>

                  <td className="px-4 py-4 text-emerald-400">
                    $
                    {Number(
                      contract.total_value ??
                        0,
                    ).toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-amber-400">
                    $
                    {Number(
                      contract.guaranteed_value ??
                        0,
                    ).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {contracts.length} active
        contracts in the LeagueVerse
        Demo League.
      </p>
    </div>
  );
}