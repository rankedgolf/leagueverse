import { DemoLeagueShell } from "@/features/demo/components/demo-league-shell";
import { DemoLeagueService } from "@/features/demo/services/demo-league-service";

export default async function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const league =
    await DemoLeagueService.getLeague();

  return (
    <DemoLeagueShell
      leagueName={league.name}
      seasonName={
        league.season?.name ??
        (league.season
          ? `${league.season.year} Season`
          : null)
      }
    >
      {children}
    </DemoLeagueShell>
  );
}