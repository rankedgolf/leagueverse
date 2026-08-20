import { DemoLeagueService } from "@/features/demo/services/demo-league-service";
import { TransactionRepository } from "@/features/transactions/repositories/transaction-repository";

export default async function DemoTransactionsPage() {
  const leagueId =
    DemoLeagueService.getLeagueId();

  const transactions =
    await TransactionRepository.listByLeague({
      leagueId,
      limit: 50,
    });

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Transactions
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          League Activity
        </h1>

        <p className="mt-3 max-w-3xl text-slate-400">
          Review trades, acquisitions,
          contract changes, and other
          front-office activity across
          the LeagueVerse Demo League.
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-xl font-bold">
            No transactions found
          </h2>

          <p className="mt-2 text-slate-400">
            This demo league does not
            currently contain any
            recorded transactions.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {transactions.map(
            (transaction) => (
              <div
                key={transaction.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold capitalize text-white">
                      {transaction.type.replaceAll(
                        "_",
                        " ",
                      )}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Source:
                      {" "}
                      {transaction.source}
                    </p>
                  </div>

                  <div className="rounded-full border border-slate-700 px-4 py-2 text-sm capitalize text-slate-300">
                    {
                      transaction.status
                    }
                  </div>
                </div>

                {transaction.notes ? (
                  <p className="mt-4 text-slate-400">
                    {
                      transaction.notes
                    }
                  </p>
                ) : null}

                {transaction.items
                  .length >
                0 ? (
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-slate-500">
                        <tr>
                          <th className="py-3 text-left">
                            Item Type
                          </th>

                          <th className="py-3 text-left">
                            Roster Action
                          </th>

                          <th className="py-3 text-left">
                            Contract Action
                          </th>

                          <th className="py-3 text-left">
                            Salary Before
                          </th>

                          <th className="py-3 text-left">
                            Salary After
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {transaction.items.map(
                          (
                            item,
                          ) => (
                            <tr
                              key={
                                item.id
                              }
                              className="border-t border-slate-800"
                            >
                              <td className="py-3 capitalize text-white">
                                {item.itemType.replaceAll(
                                  "_",
                                  " ",
                                )}
                              </td>

                              <td className="py-3 capitalize text-slate-400">
                                {item.rosterAction ??
                                  "—"}
                              </td>

                              <td className="py-3 capitalize text-slate-400">
                                {item.contractAction ??
                                  "—"}
                              </td>

                              <td className="py-3 text-slate-400">
                                {item.salaryBefore !==
                                null
                                  ? `$${item.salaryBefore}`
                                  : "—"}
                              </td>

                              <td className="py-3 text-slate-400">
                                {item.salaryAfter !==
                                null
                                  ? `$${item.salaryAfter}`
                                  : "—"}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}