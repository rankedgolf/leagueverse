import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeagueService } from "@/features/leagues/services/league-service";
import { LeagueHome } from "@/features/leagues/components/league-home";

type LeaguePageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { leagueId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dashboard = await LeagueService.getDashboard(leagueId, user.id);

  if (!dashboard) {
    notFound();
  }

  return <LeagueHome dashboard={dashboard} />;
}