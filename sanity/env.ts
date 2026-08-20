function assertValue<T>(
  value: T | undefined,
  errorMessage: string,
): T {
  if (value === undefined) {
    throw new Error(
      errorMessage,
    );
  }

  return value;
}

export const projectId =
  assertValue(
    process.env
      .NEXT_PUBLIC_SANITY_PROJECT_ID,
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID",
  );

export const dataset =
  assertValue(
    process.env
      .NEXT_PUBLIC_SANITY_DATASET,
    "Missing NEXT_PUBLIC_SANITY_DATASET",
  );

export const apiVersion =
  process.env
    .NEXT_PUBLIC_SANITY_API_VERSION ??
  "2026-08-18";
