import { TransactionRepository } from "@/features/transactions/repositories/transaction-repository";
import { TransactionReviewControls } from "@/features/transactions/components/transaction-review-controls";
import { ApproveAllTransactionsButton } from "@/features/transactions/components/approve-all-transactions-button";
import { PendingTransactionSelection } from "@/features/transactions/components/pending-transaction-selection";
import { ApplyTransactionButton } from "@/features/transactions/components/apply-transaction-button";
import { ApprovedTransactionSelection } from "@/features/transactions/components/approved-transaction-selection";
import Link from "next/link";

type TransactionsPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getStatusClasses(status: string): string {
  switch (status) {
    case "pending":
      return "border-amber-900/60 bg-amber-950/40 text-amber-300";

    case "approved":
    case "applying":
      return "border-blue-900/60 bg-blue-950/40 text-blue-300";

    case "completed":
      return "border-emerald-900/60 bg-emerald-950/40 text-emerald-300";

    case "rejected":
    case "failed":
    case "cancelled":
      return "border-red-900/60 bg-red-950/40 text-red-300";

    default:
      return "border-slate-700 bg-slate-950 text-slate-300";
  }
}

export default async function TransactionsPage({
  params,
}: TransactionsPageProps) {
  const { leagueId } = await params;

  const transactions =
    await TransactionRepository.listByLeague({
      leagueId,
      limit: 100,
    });

  const pendingTransactions =
    transactions.filter(
      (transaction) =>
        transaction.status === "pending",
    );

  const approvedTransactions =
  transactions.filter(
    (transaction) =>
      transaction.status === "approved",
  );

const historyTransactions =
  transactions.filter(
    (transaction) =>
      transaction.status !== "pending" &&
      transaction.status !== "approved",
  );

 return (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-sm font-medium text-emerald-400">
          Commissioner Tools
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Transactions
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Review, approve, apply, and audit league transactions.
        </p>
      </div>

      <Link
        href={`/leagues/${leagueId}/transactions/new-trade`}
        className="inline-flex h-fit rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
      >
        Create Trade
      </Link>
    </div>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Pending"
        value={String(
          pendingTransactions.length,
        )}
        detail="Awaiting commissioner review"
        valueClassName={
          pendingTransactions.length > 0
            ? "text-amber-400"
            : "text-white"
        }
      />

      <SummaryCard
        label="Completed"
        value={String(
          transactions.filter(
            (transaction) =>
              transaction.status ===
              "completed",
          ).length,
        )}
        detail="Successfully applied"
        valueClassName="text-emerald-400"
      />

      <SummaryCard
        label="Failed"
        value={String(
          transactions.filter(
            (transaction) =>
              transaction.status ===
              "failed",
          ).length,
        )}
        detail="Needs attention"
        valueClassName={
          transactions.some(
            (transaction) =>
              transaction.status ===
              "failed",
          )
            ? "text-red-400"
            : "text-white"
        }
      />

      <SummaryCard
        label="Total"
        value={String(transactions.length)}
        detail="All recorded transactions"
      />
    </section>

    <section className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Pending Review
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Review transactions individually, approve selected
            transactions, or approve the entire pending queue at once.
          </p>
        </div>

        {pendingTransactions.length > 0 ? (
          <ApproveAllTransactionsButton
            leagueId={leagueId}
            pendingCount={pendingTransactions.length}
          />
        ) : null}
      </div>

      {pendingTransactions.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="font-medium text-white">
            No pending transactions
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Sleeper sync changes and commissioner-created actions will
            appear here for review.
          </p>
        </div>
      ) : (
        <PendingTransactionSelection
          leagueId={leagueId}
          transactions={pendingTransactions}
        />
      )}
    </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Pending"
          value={String(
            pendingTransactions.length,
          )}
          detail="Awaiting commissioner review"
          valueClassName={
            pendingTransactions.length > 0
              ? "text-amber-400"
              : "text-white"
          }
        />

        <SummaryCard
          label="Completed"
          value={String(
            transactions.filter(
              (transaction) =>
                transaction.status ===
                "completed",
            ).length,
          )}
          detail="Successfully applied"
          valueClassName="text-emerald-400"
        />

        <SummaryCard
          label="Failed"
          value={String(
            transactions.filter(
              (transaction) =>
                transaction.status ===
                "failed",
            ).length,
          )}
          detail="Needs attention"
          valueClassName={
            transactions.some(
              (transaction) =>
                transaction.status ===
                "failed",
            )
              ? "text-red-400"
              : "text-white"
          }
        />

        <SummaryCard
          label="Total"
          value={String(transactions.length)}
          detail="All recorded transactions"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Pending Review
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Review transactions individually, approve selected
              transactions, or approve the entire pending queue at once.
            </p>
          </div>

          {pendingTransactions.length > 0 ? (
            <ApproveAllTransactionsButton
              leagueId={leagueId}
              pendingCount={pendingTransactions.length}
            />
          ) : null}
        </div>

        {pendingTransactions.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
            <p className="font-medium text-white">
              No pending transactions
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Sleeper sync changes and commissioner-created actions will
              appear here for review.
            </p>
          </div>
        ) : (
          <PendingTransactionSelection
            leagueId={leagueId}
            transactions={pendingTransactions}
          />
        )}
      </section>

      {approvedTransactions.length > 0 ? (
  <section className="space-y-4">
    <div>
      <h2 className="text-xl font-semibold text-white">
        Approved for Application
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        Apply approved transactions individually, select specific
        transactions, or apply the entire approved queue.
      </p>
    </div>

    <ApprovedTransactionSelection
      leagueId={leagueId}
      transactions={approvedTransactions}
    />
  </section>
) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Transaction History
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Approved, completed, rejected, cancelled, and failed
            transactions.
          </p>
        </div>

        {historyTransactions.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-sm text-slate-400">
            No transaction history yet.
          </div>
        ) : (
          <div className="space-y-4">
            {historyTransactions.map(
              (transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

type TransactionCardProps = {
  transaction: Awaited<
    ReturnType<
      typeof TransactionRepository.listByLeague
    >
  >[number];
};

function TransactionCard({
  transaction,
}: TransactionCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-white">
              {formatLabel(transaction.type)}
            </h3>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                transaction.status,
              )}`}
            >
              {formatLabel(transaction.status)}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            {formatLabel(transaction.source)}
            {transaction.provider
              ? ` · ${formatLabel(
                  transaction.provider,
                )}`
              : ""}
          </p>

          {transaction.notes ? (
            <p className="mt-2 text-sm text-slate-300">
              {transaction.notes}
            </p>
          ) : null}
        </div>

        <div className="text-left text-xs text-slate-500 sm:text-right">
          <p>
            Occurred:{" "}
            {formatDateTime(
              transaction.occurredAt,
            )}
          </p>

          <p className="mt-1">
            Created:{" "}
            {formatDateTime(
              transaction.createdAt,
            )}
          </p>

          <p className="mt-1 break-all">
            ID: {transaction.id}
          </p>

          <Link
  href={`/leagues/${transaction.leagueId}/transactions/${transaction.id}`}
  className="mt-3 inline-flex text-sm font-semibold text-emerald-400 hover:text-emerald-300"
>
  View Details →
</Link>
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {transaction.items.map((item) => {
          const playerName =
            typeof item.metadata.playerName ===
            "string"
              ? item.metadata.playerName
              : "Player";

          const message =
            typeof item.metadata.message ===
            "string"
              ? item.metadata.message
              : null;

          return (
            <div
              key={item.id}
              className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <p className="font-medium text-white">
                  {playerName}
                </p>

                {message ? (
                  <p className="mt-1 text-sm text-slate-400">
                    {message}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  {item.rosterAction ? (
                    <span className="rounded-full border border-blue-900/60 bg-blue-950/40 px-2.5 py-1 text-xs font-medium text-blue-300">
                      Roster:{" "}
                      {formatLabel(
                        item.rosterAction,
                      )}
                    </span>
                  ) : null}

                  {item.contractAction ? (
                    <span className="rounded-full border border-violet-900/60 bg-violet-950/40 px-2.5 py-1 text-xs font-medium text-violet-300">
                      Contract:{" "}
                      {formatLabel(
                        item.contractAction,
                      )}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="grid min-w-[300px] grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                <TeamReference
                  label="From Team"
                  value={
                    item.fromTeamId ??
                    "Free Agent"
                  }
                />

                <span className="text-slate-600">
                  →
                </span>

                <TeamReference
                  label="To Team"
                  value={
                    item.toTeamId ??
                    "Free Agent"
                  }
                  align="right"
                />
              </div>
            </div>
          );
        })}
      </div>

     {transaction.status === "pending" ? (
  <div className="border-t border-slate-800 p-5">
    <TransactionReviewControls
      leagueId={transaction.leagueId}
      transactionId={transaction.id}
      itemCount={transaction.items.length}
    />
  </div>
) : null}

{transaction.status === "approved" ? (
  <div className="flex flex-col gap-4 border-t border-blue-900/40 bg-blue-950/20 p-5 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="font-medium text-blue-300">
        Approved for application
      </p>

      <p className="mt-1 text-sm text-slate-400">
        Applying this transaction will update the LeagueVerse roster,
        player ownership, and contract records.
      </p>
    </div>

    <ApplyTransactionButton
      leagueId={transaction.leagueId}
      transactionId={transaction.id}
      itemCount={transaction.items.length}
    />
  </div>
) : null}

      {transaction.errorMessage ? (
        <div className="border-t border-red-900/40 bg-red-950/20 p-5 text-sm text-red-300">
          {transaction.errorMessage}
        </div>
      ) : null}
    </article>
  );
}

type TeamReferenceProps = {
  label: string;
  value: string;
  align?: "left" | "right";
};

function TeamReference({
  label,
  value,
  align = "left",
}: TeamReferenceProps) {
  return (
    <div
      className={
        align === "right"
          ? "text-right"
          : "text-left"
      }
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-all font-medium text-white">
        {value}
      </p>
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
