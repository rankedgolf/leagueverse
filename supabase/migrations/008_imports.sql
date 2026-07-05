-- =====================================================
-- LeagueVerse
-- Migration: 008_imports.sql
-- Description: Provider integrations and import engine.
-- =====================================================

create table public.provider_connections (

    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    provider text not null,

    provider_league_id text not null,

    access_token text,

    refresh_token text,

    token_expires_at timestamptz,

    connection_status text not null default 'active',

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique (league_id, provider)
);

create trigger provider_connections_updated_at
before update on public.provider_connections
for each row
execute function public.handle_updated_at();

create table public.provider_import_jobs (

    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    provider text not null,

    import_type text not null,

    status text not null default 'pending',

    started_at timestamptz,

    completed_at timestamptz,

    error_message text,

    created_by uuid references public.profiles(id),

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger provider_import_jobs_updated_at
before update on public.provider_import_jobs
for each row
execute function public.handle_updated_at();

create table public.provider_import_logs (

    id uuid primary key default gen_random_uuid(),

    import_job_id uuid not null references public.provider_import_jobs(id) on delete cascade,

    league_id uuid not null references public.leagues(id) on delete cascade,

    raw_payload jsonb,

    normalized_payload jsonb,

    created_at timestamptz not null default now()
);

create index idx_provider_connections_league
on public.provider_connections(league_id);

create index idx_provider_import_jobs_league
on public.provider_import_jobs(league_id);

create index idx_provider_import_jobs_status
on public.provider_import_jobs(status);

create index idx_provider_import_logs_job
on public.provider_import_logs(import_job_id);