-- =====================================================
-- LeagueVerse
-- Migration: 003_teams.sql
-- Description: Teams and team ownership.
-- =====================================================

create table public.teams (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    name text not null,

    nickname text,

    abbreviation text,

    logo_url text,

    primary_color text,

    secondary_color text,

    founded_year int,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger teams_updated_at
before update on public.teams
for each row
execute function public.handle_updated_at();

create table public.team_members (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    team_id uuid not null references public.teams(id) on delete cascade,

    user_id uuid not null references public.profiles(id) on delete cascade,

    role text not null default 'manager',

    joined_at timestamptz default now(),

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique (team_id, user_id)
);

create trigger team_members_updated_at
before update on public.team_members
for each row
execute function public.handle_updated_at();

create index idx_teams_league_id
on public.teams(league_id);

create index idx_team_members_team_id
on public.team_members(team_id);

create index idx_team_members_user_id
on public.team_members(user_id);