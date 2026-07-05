import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeagueShell } from "@/features/leagues/components/league-shell";

type LeagueLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function LeagueLayout({
  children,
  params,
}: LeagueLayoutProps) {
  const { leagueId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("league_members")
    .select("id")
    .eq("league_id", leagueId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    notFound();
  }

  const { data: league } = await supabase
    .from("leagues")
    .select("id,name,current_season_id")
    .eq("id", leagueId)
    .single();

  if (!league) {
    notFound();
  }

  const { data: season } = league.current_season_id
    ? await supabase
        .from("seasons")
        .select("name")
        .eq("id", league.current_season_id)
        .single()
    : { data: null };

  return (
    <LeagueShell
      leagueId={league.id}
      leagueName={league.name}
      seasonName={season?.name}
    >
      {children}
    </LeagueShell>
  );
}