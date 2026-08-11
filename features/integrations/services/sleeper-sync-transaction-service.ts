import { createHash, randomUUID } from "node:crypto";

import type {
  CreateTransactionItemInput,
  TransactionContractAction,
  TransactionDTO,
} from "@/features/transactions/dto/transaction-dto";

import { TransactionRepository } from "@/features/transactions/repositories/transaction-repository";
import { SleeperSyncTransactionRepository } from "@/features/integrations/repositories/sleeper-sync-transaction-repository";
import { SleeperSyncPreviewService } from "@/features/integrations/services/sleeper-sync-preview-service";

type CreateSleeperSyncTransactionsInput = {
  leagueId: string;
  createdBy: string;
};

export type CreateSleeperSyncTransactionsResult = {
  batchId: string;
  transactions: TransactionDTO[];
  createdCount: number;
  existingCount: number;
};

type ContractRelation = {
  id: string;
  team_id: string | null;
  status: string | null;
  total_value: number | string | null;
};

type LeaguePlayerContext = {
  id: string;
  player_id: string;
  current_team_id: string | null;
  status: string | null;
  contracts:
    | ContractRelation
    | ContractRelation[]
    | null;
};

function unwrapRelations<T>(
  value: T | T[] | null | undefined,
): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function getActiveContract(
  context: LeaguePlayerContext | null,
): ContractRelation | null {
  if (!context) {
    return null;
  }

  return (
    unwrapRelations(context.contracts).find(
      (contract) => contract.status === "active",
    ) ?? null
  );
}

function getContractAction(params: {
  changeType: "add" | "drop" | "move" | "unmatched";
  hasActiveContract: boolean;
}): TransactionContractAction {
  switch (params.changeType) {
    case "move":
      return params.hasActiveContract
        ? "transfer"
        : "none";

    case "drop":
      return params.hasActiveContract
        ? "terminate"
        : "none";

    case "add":
      return params.hasActiveContract
        ? "retain"
        : "create";

    case "unmatched":
      return "none";
  }
}

function getTransactionType(
  changeType: "add" | "drop" | "move" | "unmatched",
): string {
  switch (changeType) {
    case "add":
      return "roster_add";

    case "drop":
      return "roster_drop";

    case "move":
      return "roster_move";

    case "unmatched":
      return "roster_review";
  }
}

function createProviderTransactionId(params: {
  externalLeagueId: string;
  sleeperPlayerId: string;
  changeType: string;
  fromTeamId: string | null;
  toTeamId: string | null;
}): string {
  const hash = createHash("sha256")
    .update(
      JSON.stringify({
        externalLeagueId: params.externalLeagueId,
        sleeperPlayerId: params.sleeperPlayerId,
        changeType: params.changeType,
        fromTeamId: params.fromTeamId,
        toTeamId: params.toTeamId,
      }),
    )
    .digest("hex")
    .slice(0, 24);

  return `roster-change-${hash}`;
}

export const SleeperSyncTransactionService = {
  async createPendingTransactions({
    leagueId,
    createdBy,
  }: CreateSleeperSyncTransactionsInput): Promise<CreateSleeperSyncTransactionsResult> {
    const preview =
      await SleeperSyncPreviewService.build({
        leagueId,
      });

    if (!preview.hasChanges) {
      throw new Error(
        "Sleeper and LeagueVerse are already in sync.",
      );
    }

    if (!preview.canApplyAutomatically) {
      throw new Error(
        "The sync preview contains unmatched players or unmapped teams that require review.",
      );
    }

    if (preview.playerChanges.length === 0) {
      throw new Error(
        "No player roster changes were found.",
      );
    }

    const activeSeason =
      await SleeperSyncTransactionRepository.getActiveSeason(
        leagueId,
      );

    if (!activeSeason) {
      throw new Error(
        "The league does not have an active season.",
      );
    }

    const playerIds = preview.playerChanges
      .map((change) => change.playerId)
      .filter(
        (playerId): playerId is string =>
          Boolean(playerId),
      );

    const contextRows =
      await SleeperSyncTransactionRepository.getLeaguePlayerContext(
        {
          leagueId,
          playerIds,
        },
      );

    const contexts =
      contextRows as LeaguePlayerContext[];

    const contextByPlayerId = new Map(
      contexts.map((context) => [
        context.player_id,
        context,
      ]),
    );

    const batchId = randomUUID();
    const transactions: TransactionDTO[] = [];

    let createdCount = 0;
    let existingCount = 0;

    for (const change of preview.playerChanges) {
      if (!change.playerId) {
        throw new Error(
          `A LeagueVerse player could not be resolved for Sleeper player ${change.sleeperPlayerId}.`,
        );
      }

      const context =
        contextByPlayerId.get(
          change.playerId,
        ) ?? null;

      const activeContract =
        getActiveContract(context);

      const contractAction =
        getContractAction({
          changeType: change.changeType,
          hasActiveContract:
            Boolean(activeContract),
        });

      const item: CreateTransactionItemInput = {
        leagueId,

        fromTeamId: change.fromTeamId,
        toTeamId: change.toTeamId,

        playerId: change.playerId,
        leaguePlayerId:
          context?.id ?? null,
        contractId:
          activeContract?.id ?? null,

        itemType: "player",

        rosterAction:
          change.changeType === "unmatched"
            ? null
            : change.changeType,

        contractAction,

        salaryBefore:
          activeContract?.total_value !==
            null &&
          activeContract?.total_value !==
            undefined
            ? Number(
                activeContract.total_value,
              )
            : null,

        salaryAfter:
          contractAction === "terminate"
            ? 0
            : activeContract?.total_value !==
                  null &&
                activeContract?.total_value !==
                  undefined
              ? Number(
                  activeContract.total_value,
                )
              : null,

        metadata: {
          sleeperPlayerId:
            change.sleeperPlayerId,
          sleeperRosterId:
            change.sleeperRosterId,
          playerName:
            change.playerName,
          message: change.message,
          syncBatchId: batchId,
        },
      };

      const providerTransactionId =
        createProviderTransactionId({
          externalLeagueId:
            preview.externalLeagueId,
          sleeperPlayerId:
            change.sleeperPlayerId,
          changeType:
            change.changeType,
          fromTeamId:
            change.fromTeamId,
          toTeamId:
            change.toTeamId,
        });

      const existingTransaction =
        await TransactionRepository.getByProviderTransaction(
          {
            leagueId,
            provider: "sleeper",
            providerTransactionId,
          },
        );

      if (existingTransaction) {
        transactions.push(
          existingTransaction,
        );
        existingCount += 1;
        continue;
      }

      const transaction =
        await TransactionRepository.create({
          leagueId,
          seasonId: activeSeason.id,

          type: getTransactionType(
            change.changeType,
          ),

          status: "pending",
          source: "sleeper_sync",
          provider: "sleeper",

          providerTransactionId,

          occurredAt:
            preview.generatedAt,

          createdBy,

          notes:
            change.message,

          metadata: {
            syncBatchId: batchId,
            externalLeagueId:
              preview.externalLeagueId,
            changeType:
              change.changeType,
            playerName:
              change.playerName,
            generatedAt:
              preview.generatedAt,
          },

          items: [item],
        });

      transactions.push(transaction);
      createdCount += 1;
    }

    return {
      batchId,
      transactions,
      createdCount,
      existingCount,
    };
  },
};