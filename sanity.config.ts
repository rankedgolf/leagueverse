"use client";

import {
  defineConfig,
} from "sanity";

import {
  structureTool,
} from "sanity/structure";

import {
  dataset,
  projectId,
} from "@/sanity/env";

import {
  schemaTypes,
} from "@/sanity/schemaTypes";

export default defineConfig({
  name: "leagueverse",
  title: "LeagueVerse",

  basePath:
    "/studio",

  projectId,
  dataset,

  plugins: [
    structureTool(),
  ],

  schema: {
    types:
      schemaTypes,
  },
});
