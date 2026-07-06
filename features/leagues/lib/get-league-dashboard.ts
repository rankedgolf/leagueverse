import { createClient } from "@/lib/supabase/server";
import { getLeagueTeams } from "@/features/teams/lib/get-league-teams";

export async function getLeagueDashboard(leagueId: string, userId: string) {
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("league_members")
    .select("role,status")
    .eq("league_id", leagueId)
    .eq("user_id", userId)
    .single();

  if (!membership) {
    return null;
  }

  const { data: league } = await supabase
    .from("leagues")
    .select("id,name,slug,current_season_id,created_at")
    .eq("id", leagueId)
    .single();

  if (!league) {
    return null;
  }

  const { data: currentSeason } = league.current_season_id
    ? await supabase
        .from("seasons")
        .select("id,name,year,status")
        .eq("id", league.current_season_id)
        .single()
    : { data: null };

  const teams = await getLeagueTeams(leagueId);

  const { count: memberCount } = await supabase
    .from("league_members")
    .select("*", { count: "exact", head: true })
    .eq("league_id", leagueId)
    .eq("status", "active");

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select("id,type,status,occurred_at,notes,created_at")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: salaryCap } = currentSeason
    ? await supabase
        .from("salary_cap_settings")
        .select("cap_amount,luxury_tax_threshold,minimum_spend")
        .eq("league_id", leagueId)
        .eq("season_id", currentSeason.id)
        .maybeSingle()
    : { data: null };

  return {
    membership,
    league,
    currentSeason,
    teams: teams || [],
    memberCount: memberCount || 0,
    recentTransactions: recentTransactions || [],
    salaryCap,
  };
}