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
  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-3xl font-bold">Membership Debug</h1>
      <p className="mt-4">User ID: {user.id}</p>
      <p>League ID from URL: {leagueId}</p>
      <p className="mt-4 text-red-400">
        No league_members row found for this user and league.
      </p>
    </main>
  );
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