-- =====================================================
-- LeagueVerse
-- Migration: 005_rosters.sql
-- Description: League roster history.
-- =====================================================

create table public.roster_entries (

    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    season_id uuid not null references public.seasons(id) on delete cascade,

    team_id uuid not null references public.teams(id) on delete cascade,

    league_player_id uuid not null references public.league_players(id) on delete cascade,

    roster_slot text,

    acquired_via text,

    acquired_transaction_id uuid,

    acquired_at timestamptz,

    released_at timestamptz,

    is_active boolean not null default true,

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger roster_entries_updated_at
before update on public.roster_entries
for each row
execute function public.handle_updated_at();

create index idx_roster_entries_league
on public.roster_entries(league_id);

create index idx_roster_entries_team
on public.roster_entries(team_id);

create index idx_roster_entries_player
on public.roster_entries(league_player_id);

create index idx_roster_entries_season
on public.roster_entries(season_id);

create index idx_roster_entries_active
on public.roster_entries(is_active);