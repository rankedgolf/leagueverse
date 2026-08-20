"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";

import { Permissions } from "@/features/authorization/dto/permissions";

import {
  parseManualImportWorkbook,
  type ManualImportPreview,
} from "@/features/manual-import/services/workbook-parser";

import {
  ManualImportPlayerMatcher,
  type ManualImportPlayerMatching,
} from "@/features/manual-import/services/manual-import-player-matcher";

export type ManualImportValidatedPreview = {
  workbook: ManualImportPreview;

  playerMatching: ManualImportPlayerMatching;
};

export type ManualImportState = {
  success: boolean;

  message: string;

  preview:
    | ManualImportValidatedPreview
    | null;
};

export async function parseWorkbookAction(
  _previousState: ManualImportState,
  formData: FormData,
): Promise<ManualImportState> {
  const leagueId =
    formData.get(
      "leagueId",
    );

  if (
    typeof leagueId !==
      "string" ||
    !leagueId
  ) {
    return {
      success:
        false,

      message:
        "League information is missing.",

      preview:
        null,
    };
  }

  try {
    /*
     * Preview remains free,
     * but only commissioners may
     * inspect/import league data.
     */
    await AuthorizationService.requirePermission({
      leagueId,

      permission:
        Permissions.ManageLeague,
    });

    const file =
      formData.get(
        "workbook",
      );

    if (
      !(file instanceof File)
    ) {
      return {
        success:
          false,

        message:
          "Select a LeagueVerse workbook to upload.",

        preview:
          null,
      };
    }

    if (
      file.size === 0
    ) {
      return {
        success:
          false,

        message:
          "The selected workbook is empty.",

        preview:
          null,
      };
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    if (
      extension !== "xlsx"
    ) {
      return {
        success:
          false,

        message:
          "Please upload the LeagueVerse .xlsx import template.",

        preview:
          null,
      };
    }

    const maxFileSize =
      5 *
      1024 *
      1024;

    if (
      file.size >
      maxFileSize
    ) {
      return {
        success:
          false,

        message:
          "The workbook is too large. Please upload a file smaller than 5 MB.",

        preview:
          null,
      };
    }

    const buffer =
      await file.arrayBuffer();

    const workbookPreview =
      parseManualImportWorkbook({
        buffer,

        fileName:
          file.name,
      });

    const playerMatching =
      await ManualImportPlayerMatcher.build(
        workbookPreview,
      );

    let message =
      "Workbook parsed successfully.";

    if (
      playerMatching.canImport
    ) {
      message =
        "Workbook parsed successfully. All roster players matched LeagueVerse.";
    } else {
      message =
        `Workbook parsed successfully, but ${playerMatching.unmatched} player(s) are unmatched and ${playerMatching.ambiguous} player(s) require review.`;
    }

    return {
      success:
        true,

      message,

      preview: {
        workbook:
          workbookPreview,

        playerMatching,
      },
    };
  } catch (error) {
    return {
      success:
        false,

      message:
        error instanceof
        Error
          ? error.message
          : "The workbook could not be processed.",

      preview:
        null,
    };
  }
}