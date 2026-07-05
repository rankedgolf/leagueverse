-- =====================================================
-- LeagueVerse
-- Migration: 004_players.sql
-- Description: Global players and league-specific player records.
-- =====================================================

create table public.players (
    id uuid primary key default gen_random_uuid(),

    sport_id uuid not null references public.sports(id),

    full_name text not null,

    first_name text,

    last_name text,

    position text,

    real_team text,

    external_ids jsonb not null default '{}',

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger players_updated_at
before update on public.players
for each row
execute function public.handle_updated_at();

create table public.league_players (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    player_id uuid not null references public.players(id) on delete cascade,

    status text not null default 'free_agent',

    current_team_id uuid references public.teams(id),

    acquired_at timestamptz,

    released_at timestamptz,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique (league_id, player_id)
);

create trigger league_players_updated_at
before update on public.league_players
for each row
execute function public.handle_updated_at();

create index idx_players_sport_id
on public.players(sport_id);

create index idx_players_full_name
on public.players(full_name);

create index idx_players_external_ids
on public.players using gin (external_ids);

create index idx_league_players_league_id
on public.league_players(league_id);

create index idx_league_players_player_id
on public.league_players(player_id);

create index idx_league_players_current_team_id
on public.league_players(current_team_id);