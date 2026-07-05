"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  createSlug,
  validateCreateLeagueInput,
} from "@/features/leagues/validation/create-league";

export async function createLeague(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { name, sportKey } = validateCreateLeagueInput(formData);

  const { data: sport, error: sportError } = await supabase
    .from("sports")
    .select("id")
    .eq("key", sportKey)
    .single();

  if (sportError || !sport) {
    throw new Error("Invalid sport selected.");
  }

  const baseSlug = createSlug(name);
  const slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .insert({
      name,
      slug,
      sport_id: sport.id,
      commissioner_id: user.id,
      provider_primary: null,
      scoring_platform_league_id: null,
    })
    .select("id")
    .single();

  if (leagueError || !league) {
    throw new Error(leagueError?.message || "Failed to create league.");
  }

  const currentYear = new Date().getFullYear();

  const { data: season, error: seasonError } = await supabase
    .from("seasons")
    .insert({
      league_id: league.id,
      name: `${currentYear} Season`,
      year: currentYear,
      status: "active",
    })
    .select("id")
    .single();

  if (seasonError || !season) {
    throw new Error(seasonError?.message || "Failed to create season.");
  }

  await supabase
    .from("leagues")
    .update({
      current_season_id: season.id,
    })
    .eq("id", league.id);

  const { error: memberError } = await supabase.from("league_members").insert({
    league_id: league.id,
    user_id: user.id,
    role: "commissioner",
    status: "active",
  });

  if (memberError) {
    throw new Error(memberError.message);
  }

  redirect(`/leagues/${league.id}`);
}