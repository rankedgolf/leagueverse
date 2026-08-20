import { DemoLeagueService } from "@/features/demo/services/demo-league-service";
import { createClient } from "@/lib/supabase/server";

export default async function DemoRostersPage() {
  const leagueId =
    DemoLeagueService.getLeagueId();

  const supabase =
    await createClient();

  const { data: players } =
    await supabase
      .from("team_rosters")
      .select(`
        id,
        roster_slot,
        teams (
          name,
          abbreviation
        ),
        players (
          display_name,
          position,
          nfl_team,
          pro_team
        )
      `)
      .eq(
        "league_id",
        leagueId,
      )
      .order(
        "team_id",
      );

  const grouped =
    (players ?? []).reduce(
      (
        accumulator,
        roster,
      ) => {
        const team =
          Array.isArray(
            roster.teams,
          )
            ? roster.teams[0]
            : roster.teams;

        const player =
          Array.isArray(
            roster.players,
          )
            ? roster.players[0]
            : roster.players;

        const teamName =
          team?.name ??
          "Unknown Team";

        if (
          !accumulator[
            teamName
          ]
        ) {
          accumulator[
            teamName
          ] = [];
        }

        accumulator[
          teamName
        ].push({
          abbreviation:
            team?.abbreviation,
          player,
        });

        return accumulator;
      },
      {} as Record<
        string,
        Array<{
          abbreviation:
            string | null;
          player: {
            display_name:
              string | null;
            position:
              string | null;
            nfl_team:
              string | null;
            pro_team:
              string | null;
          } | null;
        }>
      >,
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Rosters
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          League Rosters
        </h1>

        <p className="mt-3 text-slate-400">
          Explore every
          roster in the
          LeagueVerse
          Demo League.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {Object.entries(
          grouped,
        ).map(
          ([
            teamName,
            roster,
          ]) => (
            <div
              key={
                teamName
              }
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="text-2xl font-bold">
                {
                  teamName
                }
              </h2>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-slate-400">
                    <tr>
                      <th className="py-3 text-left">
                        Player
                      </th>

                      <th className="py-3 text-left">
                        Pos
                      </th>

                      <th className="py-3 text-left">
                        Team
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {roster.map(
                      (
                        item,
                        index,
                      ) => (
                        <tr
                          key={
                            index
                          }
                          className="border-t border-slate-800"
                        >
                          <td className="py-3 font-medium">
                            {item
                              .player
                              ?.display_name ??
                              "Unknown"}
                          </td>

                          <td className="py-3 text-slate-400">
                            {item
                              .player
                              ?.position ??
                              "—"}
                          </td>

                          <td className="py-3 text-slate-400">
                            {item
                              .player
                              ?.nfl_team ??
                              item
                                .player
                                ?.pro_team ??
                              "—"}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}