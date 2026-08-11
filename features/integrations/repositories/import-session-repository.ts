import { createClient } from "@/lib/supabase/server";

import type { SleeperImportPreviewDTO } from "@/features/integrations/dto/sleeper-import-preview-dto";

export type ImportSessionStatus =
  | "draft"
  | "ready"
  | "importing"
  | "completed"
  | "failed"
  | "cancelled";

export type ContractYearAssignments = Record<
  string,
  number
>;

export type ImportSessionDTO = {
  id: string;

  leagueId: string;
  integrationId: string | null;

  provider: string;

  externalLeagueId: string;
  externalDraftId: string | null;

  status: ImportSessionStatus;
  currentStep: number;
  defaultContractYears: number;

  previewData: SleeperImportPreviewDTO | null;
  contractYearAssignments: ContractYearAssignments;

  createdBy: string | null;

  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

type ImportSessionRow = {
  id: string;

  league_id: string;
  integration_id: string | null;

  provider: string;

  external_league_id: string;
  external_draft_id: string | null;

  status: string;
  current_step: number;
  default_contract_years: number;

  preview_data: unknown;
  contract_year_assignments: unknown;

  created_by: string | null;

  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

type CreateImportSessionInput = {
  leagueId: string;
  integrationId: string | null;

  provider: string;

  externalLeagueId: string;
  externalDraftId: string | null;

  defaultContractYears: number;

  previewData: SleeperImportPreviewDTO;
  contractYearAssignments: ContractYearAssignments;

  createdBy: string;
};

type UpdateImportSessionInput = {
  sessionId: string;
  leagueId: string;

  currentStep?: number;
  defaultContractYears?: number;

  previewData?: SleeperImportPreviewDTO;
  contractYearAssignments?: ContractYearAssignments;

  status?: ImportSessionStatus;
  completedAt?: string | null;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function parseAssignments(
  value: unknown
): ContractYearAssignments {
  if (!isRecord(value)) {
    return {};
  }

  const assignments: ContractYearAssignments = {};

  for (const [playerId, years] of Object.entries(value)) {
    const parsedYears = Number(years);

    if (
      Number.isInteger(parsedYears) &&
      parsedYears >= 1
    ) {
      assignments[playerId] = parsedYears;
    }
  }

  return assignments;
}

function mapImportSessionRow(
  row: ImportSessionRow
): ImportSessionDTO {
  return {
    id: row.id,

    leagueId: row.league_id,
    integrationId: row.integration_id,

    provider: row.provider,

    externalLeagueId: row.external_league_id,
    externalDraftId: row.external_draft_id,

    status: row.status as ImportSessionStatus,
    currentStep: row.current_step,
    defaultContractYears:
      row.default_contract_years,

    previewData:
      isRecord(row.preview_data) &&
      Object.keys(row.preview_data).length > 0
        ? (row.preview_data as SleeperImportPreviewDTO)
        : null,

    contractYearAssignments: parseAssignments(
      row.contract_year_assignments
    ),

    createdBy: row.created_by,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

const importSessionSelect = `
  id,
  league_id,
  integration_id,
  provider,
  external_league_id,
  external_draft_id,
  status,
  current_step,
  default_contract_years,
  preview_data,
  contract_year_assignments,
  created_by,
  created_at,
  updated_at,
  completed_at
`;

export const ImportSessionRepository = {
  async getActiveByLeagueAndProvider(
    leagueId: string,
    provider: string
  ): Promise<ImportSessionDTO | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("import_sessions")
      .select(importSessionSelect)
      .eq("league_id", leagueId)
      .eq("provider", provider)
      .in("status", [
        "draft",
        "ready",
        "importing",
      ])
      .order("updated_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapImportSessionRow(
      data as ImportSessionRow
    );
  },

  async getById(params: {
    sessionId: string;
    leagueId: string;
  }): Promise<ImportSessionDTO | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("import_sessions")
      .select(importSessionSelect)
      .eq("id", params.sessionId)
      .eq("league_id", params.leagueId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapImportSessionRow(
      data as ImportSessionRow
    );
  },

  async create(
    input: CreateImportSessionInput
  ): Promise<ImportSessionDTO> {
    const supabase = await createClient();

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("import_sessions")
      .insert({
        league_id: input.leagueId,
        integration_id:
          input.integrationId,
        provider: input.provider,

        external_league_id:
          input.externalLeagueId,
        external_draft_id:
          input.externalDraftId,

        status: "draft",
        current_step: 1,
        default_contract_years:
          input.defaultContractYears,

        preview_data: input.previewData,
        contract_year_assignments:
          input.contractYearAssignments,

        created_by: input.createdBy,
        updated_at: now,
      })
      .select(importSessionSelect)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapImportSessionRow(
      data as ImportSessionRow
    );
  },

  async update(
    input: UpdateImportSessionInput
  ): Promise<ImportSessionDTO> {
    const supabase = await createClient();

    const values: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.currentStep !== undefined) {
      values.current_step =
        input.currentStep;
    }

    if (
      input.defaultContractYears !== undefined
    ) {
      values.default_contract_years =
        input.defaultContractYears;
    }

    if (input.previewData !== undefined) {
      values.preview_data =
        input.previewData;
    }

    if (
      input.contractYearAssignments !==
      undefined
    ) {
      values.contract_year_assignments =
        input.contractYearAssignments;
    }

    if (input.status !== undefined) {
      values.status = input.status;
    }

    if (input.completedAt !== undefined) {
      values.completed_at =
        input.completedAt;
    }

    const { data, error } = await supabase
      .from("import_sessions")
      .update(values)
      .eq("id", input.sessionId)
      .eq("league_id", input.leagueId)
      .select(importSessionSelect)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapImportSessionRow(
      data as ImportSessionRow
    );
  },

  async cancel(params: {
    sessionId: string;
    leagueId: string;
  }): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("import_sessions")
      .update({
        status: "cancelled",
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", params.sessionId)
      .eq("league_id", params.leagueId);

    if (error) {
      throw new Error(error.message);
    }
  },
};