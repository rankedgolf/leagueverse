-- =====================================================
-- LeagueVerse
-- Migration: 009_ai.sql
-- Description: AI content, context snapshots, and league memory.
-- =====================================================

create table public.ai_context_snapshots (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    season_id uuid references public.seasons(id),

    week int,

    context_type text not null,

    structured_context jsonb not null default '{}',

    created_at timestamptz not null default now()
);

create table public.ai_articles (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    season_id uuid references public.seasons(id),

    team_id uuid references public.teams(id),

    article_type text not null,

    title text not null,

    slug text not null,

    body text,

    status text not null default 'draft',

    generated_by uuid references public.profiles(id),

    ai_model text,

    source_context_id uuid references public.ai_context_snapshots(id),

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    unique (league_id, slug)
);

create trigger ai_articles_updated_at
before update on public.ai_articles
for each row
execute function public.handle_updated_at();

create table public.league_memory_items (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    season_id uuid references public.seasons(id),

    team_id uuid references public.teams(id),

    memory_type text not null,

    title text not null,

    description text,

    importance_score int not null default 1,

    occurred_at timestamptz,

    metadata jsonb not null default '{}',

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger league_memory_items_updated_at
before update on public.league_memory_items
for each row
execute function public.handle_updated_at();

create index idx_ai_context_snapshots_league
on public.ai_context_snapshots(league_id);

create index idx_ai_articles_league
on public.ai_articles(league_id);

create index idx_ai_articles_type
on public.ai_articles(article_type);

create index idx_league_memory_items_league
on public.league_memory_items(league_id);

create index idx_league_memory_items_team
on public.league_memory_items(team_id);

create index idx_league_memory_items_type
on public.league_memory_items(memory_type);