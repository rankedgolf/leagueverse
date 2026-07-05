-- =====================================================
-- LeagueVerse
-- Migration: 002_leagues.sql
-- Description: Leagues, seasons and league membership.
-- =====================================================

create table public.leagues (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    slug text not null unique,

    sport_id uuid not null references public.sports(id),

    commissioner_id uuid not null references public.profiles(id),

    current_season_id uuid null,

    provider_primary text null,

    scoring_platform_league_id text null,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger leagues_updated_at
before update on public.leagues
for each row
execute function public.handle_updated_at();

create table public.seasons (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    name text not null,

    year int not null,

    starts_at date null,

    ends_at date null,

    status text not null default 'upcoming',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique (league_id, year)
);

create trigger seasons_updated_at
before update on public.seasons
for each row
execute function public.handle_updated_at();

alter table public.leagues
add constraint leagues_current_season_id_fkey
foreign key (current_season_id) references public.seasons(id);

create table public.league_members (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    user_id uuid not null references public.profiles(id) on delete cascade,

    role text not null default 'manager',

    status text not null default 'active',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique (league_id, user_id)
);

create trigger league_members_updated_at
before update on public.league_members
for each row
execute function public.handle_updated_at();

create index idx_leagues_commissioner_id on public.leagues(commissioner_id);
create index idx_leagues_sport_id on public.leagues(sport_id);
create index idx_league_members_league_id on public.league_members(league_id);
create index idx_league_members_user_id on public.league_members(user_id);