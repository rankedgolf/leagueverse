import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { FreeAgencyMarketService } from "@/features/free-agency/services/free-agency-market-service";
import { FreeAgencyOfferService } from "@/features/free-agency/services/free-agency-offer-service";

import { InitializeFreeAgentMarketButton } from "@/features/free-agency/components/initialize-free-agent-market-button";
import { MakeFreeAgentOfferForm } from "@/features/free-agency/components/make-free-agent-offer-form";
import { MyFreeAgencyOffers } from "@/features/free-agency/components/my-free-agency-offers";
import { FreeAgencyPeriodService } from "@/features/free-agency/services/free-agency-period-service";
import { FreeAgencyControlCenter } from "@/features/free-agency/components/free-agency-control-center";

type FreeAgencyPageProps = {
  params: Promise<{
    leagueId: string;
  }>;

  searchParams: Promise<{
    position?: string;
    q?: string;
  }>;
};

export default async function FreeAgencyPage({
  params,
  searchParams,
}: FreeAgencyPageProps) {
  const { leagueId } = await params;
  const filters = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    freeAgents,
    myOffersResult,
    activePeriod,
  ] = await Promise.all([
    FreeAgencyMarketService.getMarket(
      leagueId,
    ),

    user
      ? FreeAgencyOfferService.getMyOffers({
          leagueId,
          userId: user.id,
        })
      : Promise.resolve({
          team: null,
          offers: [],
        }),

   FreeAgencyPeriodService.getCurrentPeriod(
  leagueId,
),
  ]);

  const selectedPosition =
    filters.position ?? "";

  const searchTerm =
    filters.q?.trim().toLowerCase() ?? "";

  const positions = Array.from(
    new Set(
      freeAgents
        .map(
          (player) =>
            player.position,
        )
        .filter(
          (
            position,
          ): position is string =>
            Boolean(position),
        ),
    ),
  ).sort();

  const filteredFreeAgents =
    freeAgents.filter(
      (player) => {
        if (
          selectedPosition &&
          player.position !==
            selectedPosition
        ) {
          return false;
        }

        if (
          searchTerm &&
          !player.name
            .toLowerCase()
            .includes(
              searchTerm,
            )
        ) {
          return false;
        }

        return true;
      },
    );

  const playersWithOffers =
    freeAgents.filter(
      (player) =>
        player.offerCount > 0,
    ).length;

  const activeOfferCount =
    freeAgents.reduce(
      (sum, player) =>
        sum +
        player.offerCount,
      0,
    );

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-emerald-400">
          Player Market
        </p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Free Agency
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Browse available players, evaluate their market intelligence,
          and submit contract offers. Player decisions will ultimately
          be made automatically by the LeagueVerse Free Agency engine.
        </p>

        <div className="mt-4">
          <InitializeFreeAgentMarketButton
            leagueId={leagueId}
          />

          {activePeriod ? (
  <FreeAgencyControlCenter
    leagueId={leagueId}
    period={activePeriod}
  />
) : null}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Free Agents"
          value={String(
            freeAgents.length,
          )}
          detail="Available players"
        />

        <SummaryCard
          label="Players With Offers"
          value={String(
            playersWithOffers,
          )}
          detail="Active market interest"
          valueClassName={
            playersWithOffers > 0
              ? "text-emerald-400"
              : "text-white"
          }
        />

        <SummaryCard
          label="Active Offers"
          value={String(
            activeOfferCount,
          )}
          detail="Outstanding contract offers"
          valueClassName={
            activeOfferCount > 0
              ? "text-emerald-400"
              : "text-white"
          }
        />
      </section>

      <MyFreeAgencyOffers
        leagueId={leagueId}
        teamName={
          myOffersResult.team?.name ??
          null
        }
        offers={
          myOffersResult.offers
        }
      />

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <form
          method="get"
          className="grid gap-4 md:grid-cols-[1fr_220px_auto]"
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search
            </label>

            <input
              type="search"
              name="q"
              defaultValue={
                filters.q ?? ""
              }
              placeholder="Search players..."
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Position
            </label>

            <select
              name="position"
              defaultValue={
                selectedPosition
              }
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="">
                All Positions
              </option>

              {positions.map(
                (position) => (
                  <option
                    key={position}
                    value={position}
                  >
                    {position}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
            >
              Apply
            </button>

            <Link
              href={`/leagues/${leagueId}/free-agency`}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Available Players
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {filteredFreeAgents.length} player
            {filteredFreeAgents.length === 1
              ? ""
              : "s"}{" "}
            shown.
          </p>
        </div>

        {filteredFreeAgents.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
            <p className="font-medium text-white">
              No free agents found
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Try changing your search or position filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredFreeAgents.map(
              (player) => (
                <article
                  key={
                    player.leaguePlayerId
                  }
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {player.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {player.position ??
                          "—"}
                        {player.proTeam
                          ? ` · ${player.proTeam}`
                          : ""}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-center">
                      <p className="text-lg font-bold text-white">
                        {
                          player.offerCount
                        }
                      </p>

                      <p className="text-[10px] uppercase tracking-wide text-slate-500">
                        Offer
                        {player.offerCount ===
                        1
                          ? ""
                          : "s"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Market Intelligence
                    </p>

                    {player.personalityHints.length === 0 ? (
                      <p className="mt-3 text-sm italic text-slate-500">
                        Market priorities are unclear.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {player.personalityHints.map(
                          (hint) => (
                            <div
                              key={hint}
                              className="flex items-start gap-2 text-sm text-slate-300"
                            >
                              <span className="mt-1 text-emerald-400">
                                •
                              </span>

                              <span>
                                {hint}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-800 pt-4">
                    <MakeFreeAgentOfferForm
                      leagueId={leagueId}
                      leaguePlayerId={
                        player.leaguePlayerId
                      }
                      playerName={
                        player.name
                      }
                    />
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
};

function SummaryCard({
  label,
  value,
  detail,
  valueClassName = "text-white",
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}