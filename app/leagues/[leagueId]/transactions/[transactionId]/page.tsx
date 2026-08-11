import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyTransactionButton } from "@/features/transactions/components/apply-transaction-button";
import { TransactionReviewControls } from "@/features/transactions/components/transaction-review-controls";
import { TransactionRepository } from "@/features/transactions/repositories/transaction-repository";

type TransactionDetailPageProps = {
  params: Promise<{
    leagueId: string;
    transactionId: string;
  }>;
};

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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

function getStatusClasses(
  status: string,
): string {
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

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const {
    leagueId,
    transactionId,
  } = await params;

  const transaction =
    await TransactionRepository.getById({
      leagueId,
      transactionId,
    });

  if (!transaction) {
    notFound();
  }

  const playerName =
    transaction.items.length === 1 &&
    typeof transaction.items[0].metadata.playerName ===
      "string"
      ? transaction.items[0].metadata.playerName
      : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/leagues/${leagueId}/transactions`}
          className="text-sm font-medium text-slate-400 hover:text-white"
        >
          ← Back to Transactions
        </Link>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-400">
              Transaction Audit
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-white">
                {formatLabel(
                  transaction.type,
                )}
              </h1>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                  transaction.status,
                )}`}
              >
                {formatLabel(
                  transaction.status,
                )}
              </span>
            </div>

            {playerName ? (
              <p className="mt-2 text-lg text-slate-300">
                {playerName}
              </p>
            ) : null}

            {transaction.notes ? (
              <p className="mt-3 max-w-3xl text-sm text-slate-400">
                {transaction.notes}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-500">
            <p>Transaction ID</p>

            <p className="mt-1 break-all font-mono text-slate-300">
              {transaction.id}
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AuditCard
          label="Source"
          value={formatLabel(
            transaction.source,
          )}
          detail={
            transaction.provider
              ? `Provider: ${formatLabel(
                  transaction.provider,
                )}`
              : "LeagueVerse"
          }
        />

        <AuditCard
          label="Created"
          value={formatDateTime(
            transaction.createdAt,
          )}
          detail="Transaction recorded"
        />

        <AuditCard
          label="Approved"
          value={formatDateTime(
            transaction.approvedAt,
          )}
          detail={
            transaction.approvedBy
              ? "Commissioner approved"
              : "Not approved"
          }
        />

        <AuditCard
          label="Applied"
          value={formatDateTime(
            transaction.appliedAt,
          )}
          detail={
            transaction.status ===
            "completed"
              ? "League records updated"
              : "Not applied"
          }
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-5">
          <h2 className="text-lg font-semibold text-white">
            Transaction Items
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Every roster and contract change included in this transaction.
          </p>
        </div>

        <div className="divide-y divide-slate-800">
          {transaction.items.map(
            (item) => {
              const itemPlayerName =
                typeof item.metadata
                  .playerName === "string"
                  ? item.metadata.playerName
                  : "Player";

              const message =
                typeof item.metadata
                  .message === "string"
                  ? item.metadata.message
                  : null;

              return (
                <div
                  key={item.id}
                  className="space-y-5 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {itemPlayerName}
                      </h3>

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

                    <div className="grid min-w-[320px] grid-cols-[1fr_auto_1fr] items-center gap-4">
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

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailField
                      label="Player ID"
                      value={
                        item.playerId ??
                        "—"
                      }
                    />

                    <DetailField
                      label="League Player ID"
                      value={
                        item.leaguePlayerId ??
                        "—"
                      }
                    />

                    <DetailField
                      label="Contract ID"
                      value={
                        item.contractId ??
                        "—"
                      }
                    />

                    <DetailField
                      label="Item Type"
                      value={formatLabel(
                        item.itemType,
                      )}
                    />
                  </div>

                  {(item.salaryBefore !==
                    null ||
                    item.salaryAfter !==
                      null) ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <DetailField
                        label="Salary Before"
                        value={
                          item.salaryBefore !==
                          null
                            ? `$${item.salaryBefore.toFixed(
                                2,
                              )}`
                            : "—"
                        }
                      />

                      <DetailField
                        label="Salary After"
                        value={
                          item.salaryAfter !==
                          null
                            ? `$${item.salaryAfter.toFixed(
                                2,
                              )}`
                            : "—"
                        }
                      />
                    </div>
                  ) : null}
                </div>
              );
            },
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold text-white">
          Audit Timeline
        </h2>

        <div className="mt-5 space-y-0">
          <TimelineItem
            label="Created"
            value={formatDateTime(
              transaction.createdAt,
            )}
            completed
          />

          <TimelineItem
            label="Approved"
            value={formatDateTime(
              transaction.approvedAt,
            )}
            completed={Boolean(
              transaction.approvedAt,
            )}
          />

          <TimelineItem
            label="Applied"
            value={formatDateTime(
              transaction.appliedAt,
            )}
            completed={Boolean(
              transaction.appliedAt,
            )}
          />

          {transaction.rejectedAt ? (
            <TimelineItem
              label="Rejected"
              value={formatDateTime(
                transaction.rejectedAt,
              )}
              completed
              destructive
            />
          ) : null}

          {transaction.status ===
            "failed" ? (
            <TimelineItem
              label="Failed"
              value={
                transaction.errorMessage ??
                "Application failed"
              }
              completed
              destructive
            />
          ) : null}
        </div>
      </section>

      {transaction.providerTransactionId ? (
        <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold text-white">
            Provider Details
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailField
              label="Provider"
              value={
                transaction.provider
                  ? formatLabel(
                      transaction.provider,
                    )
                  : "—"
              }
            />

            <DetailField
              label="Provider Transaction ID"
              value={
                transaction.providerTransactionId
              }
            />
          </div>
        </section>
      ) : null}

      {transaction.errorMessage ? (
        <section className="rounded-xl border border-red-900/60 bg-red-950/20 p-5">
          <h2 className="text-lg font-semibold text-red-300">
            Application Error
          </h2>

          <p className="mt-2 text-sm text-red-200">
            {transaction.errorMessage}
          </p>
        </section>
      ) : null}

      {transaction.status ===
        "pending" ? (
        <section className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-5">
          <TransactionReviewControls
            leagueId={
              transaction.leagueId
            }
            transactionId={
              transaction.id
            }
            itemCount={
              transaction.items.length
            }
          />
        </section>
      ) : null}

      {transaction.status ===
        "approved" ? (
        <section className="flex flex-col gap-4 rounded-xl border border-blue-900/40 bg-blue-950/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-blue-300">
              Approved for application
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Apply this transaction to update LeagueVerse roster and
              contract records.
            </p>
          </div>

          <ApplyTransactionButton
            leagueId={
              transaction.leagueId
            }
            transactionId={
              transaction.id
            }
            itemCount={
              transaction.items.length
            }
          />
        </section>
      ) : null}
    </div>
  );
}

type AuditCardProps = {
  label: string;
  value: string;
  detail: string;
};

function AuditCard({
  label,
  value,
  detail,
}: AuditCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
};

function DetailField({
  label,
  value,
}: DetailFieldProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-all text-sm font-medium text-white">
        {value}
      </p>
    </div>
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

      <p className="mt-1 break-all text-sm font-medium text-white">
        {value}
      </p>
    </div>
  );
}

type TimelineItemProps = {
  label: string;
  value: string;
  completed: boolean;
  destructive?: boolean;
};

function TimelineItem({
  label,
  value,
  completed,
  destructive = false,
}: TimelineItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`h-3 w-3 rounded-full ${
            completed
              ? destructive
                ? "bg-red-500"
                : "bg-emerald-500"
              : "bg-slate-700"
          }`}
        />

        <div className="h-full min-h-10 w-px bg-slate-800" />
      </div>

      <div className="pb-6">
        <p
          className={`font-medium ${
            destructive
              ? "text-red-300"
              : completed
                ? "text-white"
                : "text-slate-500"
          }`}
        >
          {label}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          {value}
        </p>
      </div>
    </div>
  );
}