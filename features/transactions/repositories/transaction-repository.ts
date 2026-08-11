import { createClient } from "@/lib/supabase/server";

import type {
  CreateTransactionInput,
  TransactionDTO,
  TransactionItemDTO,
  TransactionStatus,
} from "@/features/transactions/dto/transaction-dto";

import type { ServerSupabaseClient } from "@/lib/supabase/types";

type TransactionRow = {
  id: string;

  league_id: string;
  season_id: string | null;

  type: string;
  status: string;

  source: string;
  provider: string | null;

  provider_transaction_id: string | null;

  occurred_at: string | null;

  created_by: string | null;
  approved_by: string | null;

  approved_at: string | null;
  applied_at: string | null;
  rejected_at: string | null;

  notes: string | null;
  error_message: string | null;

  metadata: unknown;

  created_at: string;
  updated_at: string;
};

type TransactionItemRow = {
  id: string;

  transaction_id: string;
  league_id: string;

  from_team_id: string | null;
  to_team_id: string | null;

  player_id: string | null;
  league_player_id: string | null;
  contract_id: string | null;
  draft_pick_id: string | null;

  item_type: string;

  roster_action: string | null;
  contract_action: string | null;

  salary_before: number | string | null;
  salary_after: number | string | null;

  metadata: unknown;

  created_at: string;
};

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseNumber(
  value: number | string | null,
): number | null {
  if (value === null) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

function mapTransactionItemRow(
  row: TransactionItemRow,
): TransactionItemDTO {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    leagueId: row.league_id,

    fromTeamId: row.from_team_id,
    toTeamId: row.to_team_id,

    playerId: row.player_id,
    leaguePlayerId: row.league_player_id,
    contractId: row.contract_id,
    draftPickId: row.draft_pick_id,

    itemType: row.item_type,

    rosterAction:
      row.roster_action as TransactionItemDTO["rosterAction"],

    contractAction:
      row.contract_action as TransactionItemDTO["contractAction"],

    salaryBefore: parseNumber(
      row.salary_before,
    ),

    salaryAfter: parseNumber(
      row.salary_after,
    ),

    metadata: isRecord(row.metadata)
      ? row.metadata
      : {},

    createdAt: row.created_at,
  };
}

function mapTransactionRow(
  row: TransactionRow,
  items: TransactionItemDTO[],
): TransactionDTO {
  return {
    id: row.id,

    leagueId: row.league_id,
    seasonId: row.season_id,

    type: row.type,
    status:
      row.status as TransactionDTO["status"],

    source:
      row.source as TransactionDTO["source"],

    provider:
      row.provider as TransactionDTO["provider"],

    providerTransactionId:
      row.provider_transaction_id,

    occurredAt: row.occurred_at,

    createdBy: row.created_by,
    approvedBy: row.approved_by,

    approvedAt: row.approved_at,
    appliedAt: row.applied_at,
    rejectedAt: row.rejected_at,

    notes: row.notes,
    errorMessage: row.error_message,

    metadata: isRecord(row.metadata)
      ? row.metadata
      : {},

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    items,
  };
}

const transactionSelect = `
  id,
  league_id,
  season_id,
  type,
  status,
  source,
  provider,
  provider_transaction_id,
  occurred_at,
  created_by,
  approved_by,
  approved_at,
  applied_at,
  rejected_at,
  notes,
  error_message,
  metadata,
  created_at,
  updated_at
`;

const transactionItemSelect = `
  id,
  transaction_id,
  league_id,
  from_team_id,
  to_team_id,
  player_id,
  league_player_id,
  contract_id,
  draft_pick_id,
  item_type,
  roster_action,
  contract_action,
  salary_before,
  salary_after,
  metadata,
  created_at
`;

export const TransactionRepository = {
  async getById(params: {
    leagueId: string;
    transactionId: string;
  }): Promise<TransactionDTO | null> {
    const supabase = await createClient();

    const [transactionResult, itemsResult] =
      await Promise.all([
        supabase
          .from("transactions")
          .select(transactionSelect)
          .eq("league_id", params.leagueId)
          .eq("id", params.transactionId)
          .maybeSingle(),

        supabase
          .from("transaction_items")
          .select(transactionItemSelect)
          .eq("league_id", params.leagueId)
          .eq(
            "transaction_id",
            params.transactionId,
          )
          .order("created_at", {
            ascending: true,
          }),
      ]);

    if (transactionResult.error) {
      throw new Error(
        transactionResult.error.message,
      );
    }

    if (itemsResult.error) {
      throw new Error(
        itemsResult.error.message,
      );
    }

    if (!transactionResult.data) {
      return null;
    }

    const items = (
      (itemsResult.data ?? []) as TransactionItemRow[]
    ).map(mapTransactionItemRow);

    return mapTransactionRow(
      transactionResult.data as TransactionRow,
      items,
    );
  },

  async getByProviderTransaction(params: {
    leagueId: string;
    provider: string;
    providerTransactionId: string;
  }): Promise<TransactionDTO | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("transactions")
      .select(transactionSelect)
      .eq("league_id", params.leagueId)
      .eq("provider", params.provider)
      .eq(
        "provider_transaction_id",
        params.providerTransactionId,
      )
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return this.getById({
      leagueId: params.leagueId,
      transactionId: data.id,
    });
  },

  async listByLeague(params: {
    leagueId: string;
    status?: TransactionStatus;
    limit?: number;
  }): Promise<TransactionDTO[]> {
    const supabase = await createClient();

    let query = supabase
      .from("transactions")
      .select(transactionSelect)
      .eq("league_id", params.leagueId)
      .order("created_at", {
        ascending: false,
      })
      .limit(params.limit ?? 50);

    if (params.status) {
      query = query.eq(
        "status",
        params.status,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    const transactionRows =
      (data ?? []) as TransactionRow[];

    if (transactionRows.length === 0) {
      return [];
    }

    const transactionIds =
      transactionRows.map(
        (transaction) => transaction.id,
      );

    const { data: itemData, error: itemError } =
      await supabase
        .from("transaction_items")
        .select(transactionItemSelect)
        .eq("league_id", params.leagueId)
        .in(
          "transaction_id",
          transactionIds,
        )
        .order("created_at", {
          ascending: true,
        });

    if (itemError) {
      throw new Error(itemError.message);
    }

    const itemsByTransactionId = new Map<
      string,
      TransactionItemDTO[]
    >();

    for (const row of
      (itemData ?? []) as TransactionItemRow[]) {
      const item =
        mapTransactionItemRow(row);

      const currentItems =
        itemsByTransactionId.get(
          item.transactionId,
        ) ?? [];

      currentItems.push(item);

      itemsByTransactionId.set(
        item.transactionId,
        currentItems,
      );
    }

    return transactionRows.map((row) =>
      mapTransactionRow(
        row,
        itemsByTransactionId.get(row.id) ??
          [],
      ),
    );
  },

 async create(
  input: CreateTransactionInput,
  client?: ServerSupabaseClient,
): Promise<TransactionDTO> {
    if (input.items.length === 0) {
      throw new Error(
        "A transaction must contain at least one item.",
      );
    }

    const supabase =
  client ?? (await createClient());

    const now = new Date().toISOString();

    const { data: transactionData, error } =
      await supabase
        .from("transactions")
        .insert({
          league_id: input.leagueId,
          season_id:
            input.seasonId ?? null,

          type: input.type,
          status:
            input.status ?? "pending",

          source: input.source,
          provider:
            input.provider ?? null,

          provider_transaction_id:
            input.providerTransactionId ??
            null,

          occurred_at:
            input.occurredAt ?? now,

          created_by:
            input.createdBy ?? null,

          notes: input.notes ?? null,

          metadata:
            input.metadata ?? {},

          updated_at: now,
        })
        .select(transactionSelect)
        .single();

    if (error) {
      throw new Error(error.message);
    }

    const transaction =
      transactionData as TransactionRow;

    const { data: itemData, error: itemError } =
      await supabase
        .from("transaction_items")
        .insert(
          input.items.map((item) => ({
            transaction_id:
              transaction.id,

            league_id: input.leagueId,

            from_team_id:
              item.fromTeamId ?? null,

            to_team_id:
              item.toTeamId ?? null,

            player_id:
              item.playerId ?? null,

            league_player_id:
              item.leaguePlayerId ?? null,

            contract_id:
              item.contractId ?? null,

            draft_pick_id:
              item.draftPickId ?? null,

            item_type: item.itemType,

            roster_action:
              item.rosterAction ?? null,

            contract_action:
              item.contractAction ?? null,

            salary_before:
              item.salaryBefore ?? null,

            salary_after:
              item.salaryAfter ?? null,

            metadata:
              item.metadata ?? {},
          })),
        )
        .select(transactionItemSelect);

    if (itemError) {
      await supabase
        .from("transactions")
        .delete()
        .eq("id", transaction.id);

      throw new Error(
        itemError.message,
      );
    }

    const items = (
      (itemData ?? []) as TransactionItemRow[]
    ).map(mapTransactionItemRow);

    return mapTransactionRow(
      transaction,
      items,
    );
  },

  async updateStatus(params: {
    leagueId: string;
    transactionId: string;
    status: TransactionStatus;
    approvedBy?: string | null;
    errorMessage?: string | null;
  }): Promise<TransactionDTO> {
    const supabase = await createClient();

    const now = new Date().toISOString();

    const values: Record<string, unknown> = {
      status: params.status,
      updated_at: now,
    };

    if (params.status === "approved") {
      values.approved_at = now;
      values.approved_by =
        params.approvedBy ?? null;
    }

    if (params.status === "rejected") {
      values.rejected_at = now;
    }

    if (params.status === "completed") {
      values.applied_at = now;
      values.error_message = null;
    }

    if (params.status === "failed") {
      values.error_message =
        params.errorMessage ??
        "Transaction application failed.";
    }

    const { error } = await supabase
      .from("transactions")
      .update(values)
      .eq("league_id", params.leagueId)
      .eq("id", params.transactionId);

    if (error) {
      throw new Error(error.message);
    }

    const transaction =
      await this.getById({
        leagueId: params.leagueId,
        transactionId:
          params.transactionId,
      });

    if (!transaction) {
      throw new Error(
        "The updated transaction could not be found.",
      );
    }

    return transaction;
  },
};