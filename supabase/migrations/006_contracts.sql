-- =====================================================
-- LeagueVerse
-- Migration: 006_contracts.sql
-- Description: Salary cap, contracts, contract years, and dead cap.
-- =====================================================

create table public.salary_cap_settings (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    season_id uuid not null references public.seasons(id) on delete cascade,

    cap_amount numeric not null default 0,

    luxury_tax_threshold numeric,

    minimum_spend numeric,

    contract_year_limit int,

    allow_dead_cap boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique (league_id, season_id)
);

create trigger salary_cap_settings_updated_at
before update on public.salary_cap_settings
for each row
execute function public.handle_updated_at();

create table public.contracts (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    team_id uuid not null references public.teams(id) on delete cascade,

    league_player_id uuid not null references public.league_players(id) on delete cascade,

    contract_type text not null default 'standard',

    status text not null default 'active',

    signed_at date,

    starts_season_id uuid references public.seasons(id),

    ends_season_id uuid references public.seasons(id),

    total_value numeric not null default 0,

    guaranteed_value numeric,

    notes text,

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger contracts_updated_at
before update on public.contracts
for each row
execute function public.handle_updated_at();

create table public.contract_years (
    id uuid primary key default gen_random_uuid(),

    contract_id uuid not null references public.contracts(id) on delete cascade,

    league_id uuid not null references public.leagues(id) on delete cascade,

    season_id uuid not null references public.seasons(id) on delete cascade,

    salary numeric not null default 0,

    bonus numeric not null default 0,

    guaranteed_amount numeric not null default 0,

    is_option_year boolean not null default false,

    option_type text,

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique (contract_id, season_id)
);

create trigger contract_years_updated_at
before update on public.contract_years
for each row
execute function public.handle_updated_at();

create table public.dead_cap_entries (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    team_id uuid not null references public.teams(id) on delete cascade,

    league_player_id uuid references public.league_players(id),

    season_id uuid not null references public.seasons(id) on delete cascade,

    amount numeric not null default 0,

    reason text not null,

    source_contract_id uuid references public.contracts(id),

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger dead_cap_entries_updated_at
before update on public.dead_cap_entries
for each row
execute function public.handle_updated_at();

create index idx_salary_cap_settings_league
on public.salary_cap_settings(league_id);

create index idx_contracts_league
on public.contracts(league_id);

create index idx_contracts_team
on public.contracts(team_id);

create index idx_contracts_player
on public.contracts(league_player_id);

create index idx_contract_years_contract
on public.contract_years(contract_id);

create index idx_contract_years_league_season
on public.contract_years(league_id, season_id);

create index idx_dead_cap_entries_team_season
on public.dead_cap_entries(team_id, season_id);