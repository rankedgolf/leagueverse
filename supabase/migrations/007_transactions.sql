-- =====================================================
-- LeagueVerse
-- Migration: 007_transactions.sql
-- Description: Transactions, transaction items, standings, and matchups.
-- =====================================================

create table public.transactions (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    season_id uuid references public.seasons(id),

    type text not null,

    status text not null default 'completed',

    occurred_at timestamptz,

    provider_transaction_id text,

    created_by uuid references public.profiles(id),

    notes text,

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger transactions_updated_at
before update on public.transactions
for each row
execute function public.handle_updated_at();

create table public.transaction_items (
    id uuid primary key default gen_random_uuid(),

    transaction_id uuid not null references public.transactions(id) on delete cascade,

    league_id uuid not null references public.leagues(id) on delete cascade,

    from_team_id uuid references public.teams(id),

    to_team_id uuid references public.teams(id),

    league_player_id uuid references public.league_players(id),

    contract_id uuid references public.contracts(id),

    item_type text not null,

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now()
);

alter table public.roster_entries
add constraint roster_entries_acquired_transaction_id_fkey
foreign key (acquired_transaction_id)
references public.transactions(id);

create table public.standings_snapshots (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    season_id uuid references public.seasons(id),

    team_id uuid references public.teams(id),

    week int,

    wins int not null default 0,

    losses int not null default 0,

    ties int not null default 0,

    points_for numeric not null default 0,

    points_against numeric not null default 0,

    rank int,

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now()
);

create table public.matchups (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    season_id uuid references public.seasons(id),

    week int,

    home_team_id uuid references public.teams(id),

    away_team_id uuid references public.teams(id),

    home_score numeric,

    away_score numeric,

    status text,

    provider_matchup_id text,

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger matchups_updated_at
before update on public.matchups
for each row
execute function public.handle_updated_at();

create index idx_transactions_league
on public.transactions(league_id);

create index idx_transactions_season
on public.transactions(season_id);

create index idx_transaction_items_transaction
on public.transaction_items(transaction_id);

create index idx_transaction_items_league
on public.transaction_items(league_id);

create index idx_standings_snapshots_league_season
on public.standings_snapshots(league_id, season_id);

create index idx_matchups_league_season_week
on public.matchups(league_id, season_id, week);