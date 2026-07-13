-- =====================================================
-- LeagueVerse
-- Migration: 011_league_invitations.sql
-- Description: League invitation links.
-- =====================================================

create table public.league_invitations (
    id uuid primary key default gen_random_uuid(),

    league_id uuid not null references public.leagues(id) on delete cascade,

    email text,

    role text not null default 'manager',

    token text not null unique,

    status text not null default 'pending',

    invited_by uuid references public.profiles(id),

    accepted_by uuid references public.profiles(id),

    expires_at timestamptz,

    accepted_at timestamptz,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger league_invitations_updated_at
before update on public.league_invitations
for each row
execute function public.handle_updated_at();

create index idx_league_invitations_league_id
on public.league_invitations(league_id);

create index idx_league_invitations_token
on public.league_invitations(token);

create index idx_league_invitations_status
on public.league_invitations(status);