import { DemoLeagueService } from "@/features/demo/services/demo-league-service";
import { createClient } from "@/lib/supabase/server";

export default async function DemoDraftPage() {
  const leagueId =
    DemoLeagueService.getLeagueId();

  const supabase =
    await createClient();

  const { data: picks, error } =
    await supabase
      .from("draft_picks")
      .select(`
        id,
        round,
        pick_number,
        status,
        original_team:teams!draft_picks_original_team_id_fkey (
          id,
          name,
          abbreviation
        ),
        current_team:teams!draft_picks_current_team_id_fkey (
          id,
          name,
          abbreviation
        ),
        seasons (
          id,
          year,
          name
        )
      `)
      .eq(
        "league_id",
        leagueId,
      )
      .eq(
        "status",
        "active",
      )
      .order(
        "season_id",
        {
          ascending: true,
        },
      )
      .order(
        "round",
        {
          ascending: true,
        },
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const grouped =
    (picks ?? []).reduce(
      (
        accumulator,
        pick,
      ) => {
        const season =
          Array.isArray(
            pick.seasons,
          )
            ? pick.seasons[0]
            : pick.seasons;

        const year =
          season?.year ??
          "Unknown";

        if (
          !accumulator[
            year
          ]
        ) {
          accumulator[
            year
          ] = [];
        }

        accumulator[
          year
        ].push(
          pick,
        );

        return accumulator;
      },
      {} as Record<
        string,
        typeof picks
      >,
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Draft
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Future Draft Capital
        </h1>

        <p className="mt-3 max-w-3xl text-slate-400">
          Track future rookie picks,
          original ownership, and
          traded draft capital across
          the entire league.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {Object.entries(
          grouped,
        ).map(
          ([
            year,
            yearPicks,
          ]) => (
            <section
              key={year}
              className="rounded-2xl border border-slate-800 bg-slate-900"
            >
              <div className="border-b border-slate-800 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                  Rookie Draft
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  {year}
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="px-4 py-4 text-left">
                        Round
                      </th>

                      <th className="px-4 py-4 text-left">
                        Pick
                      </th>

                      <th className="px-4 py-4 text-left">
                        Original Team
                      </th>

                      <th className="px-4 py-4 text-left">
                        Current Owner
                      </th>

                      <th className="px-4 py-4 text-left">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {yearPicks?.map(
                      (pick) => {
                        const originalTeam =
                          Array.isArray(
                            pick.original_team,
                          )
                            ? pick
                                .original_team[0]
                            : pick.original_team;

                        const currentTeam =
                          Array.isArray(
                            pick.current_team,
                          )
                            ? pick
                                .current_team[0]
                            : pick.current_team;

                        const traded =
                          originalTeam?.id !==
                          currentTeam?.id;

                        return (
                          <tr
                            key={pick.id}
                            className="border-t border-slate-800"
                          >
                            <td className="px-4 py-4 font-semibold text-white">
                              Round{" "}
                              {
                                pick.round
                              }
                            </td>

                            <td className="px-4 py-4 text-slate-400">
                              {pick.pick_number
                                ? `#${pick.pick_number}`
                                : "TBD"}
                            </td>

                            <td className="px-4 py-4 text-slate-300">
                              {originalTeam?.name ??
                                "Unknown"}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={
                                  traded
                                    ? "font-semibold text-violet-300"
                                    : "text-slate-300"
                                }
                              >
                                {currentTeam?.name ??
                                  "Unknown"}
                              </span>

                              {traded ? (
                                <span className="ml-2 rounded-full border border-violet-800 bg-violet-950/30 px-2 py-1 text-xs text-violet-300">
                                  Traded
                                </span>
                              ) : null}
                            </td>

                            <td className="px-4 py-4 capitalize text-slate-400">
                              {
                                pick.status
                              }
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ),
        )}
      </div>
    </div>
  );
}