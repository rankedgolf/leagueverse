"use client";

import { useState } from "react";

import {
  parseRookieDraftImport,
} from "@/features/rookie-draft/import/rookie-draft-import-parser";

import {
  previewRookieDraftImport,
} from "@/features/rookie-draft/actions/preview-rookie-draft-import";

import { RookieDraftImportPreview } from "./rookie-draft-import-preview";

type RookieDraftImportFormProps = {
  leagueId: string;
};

export function RookieDraftImportForm({
  leagueId,
}: RookieDraftImportFormProps) {
  const [value, setValue] =
    useState("");

  const [preview, setPreview] =
    useState<any>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handlePreview() {
    setIsLoading(true);

    setErrorMessage(null);

    try {
      const rows =
        parseRookieDraftImport(
          value,
        );

      const result =
        await previewRookieDraftImport({
          leagueId,
          rows,
        });

      setPreview(
        result,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate preview.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Rookie Draft Results
      </p>

      <textarea
        value={value}
        onChange={(event) =>
          setValue(
            event.target.value,
          )
        }
        rows={10}
        placeholder={`1.01 Ashton Jeanty
1.02 Tetairoa McMillan
1.03 Cam Ward`}
        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white"
      />

      <button
        type="button"
        onClick={
          handlePreview
        }
        disabled={
          isLoading
        }
        className="mt-3 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white"
      >
        {isLoading
          ? "Generating..."
          : "Preview Import"}
      </button>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}

      {preview ? (
       <RookieDraftImportPreview
  leagueId={leagueId}
  preview={preview}
/>
      ) : null}
    </div>
  );
}