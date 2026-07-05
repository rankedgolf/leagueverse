-- =====================================================
-- LeagueVerse
-- Migration: 001_core.sql
-- Description: Core extensions, helper functions,
-- timestamps, profiles and sports.
-- =====================================================

create extension if not exists pgcrypto;

-- =====================================================
-- updated_at trigger
-- =====================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- =====================================================
-- Profiles
-- =====================================================

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    email text,

    display_name text,

    avatar_url text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

-- =====================================================
-- Sports
-- =====================================================

create table public.sports (

    id uuid primary key default gen_random_uuid(),

    key text not null unique,

    name text not null,

    created_at timestamptz not null default now()
);

insert into public.sports (key, name)
values

('football','Football'),

('basketball','Basketball'),

('baseball','Baseball'),

('hockey','Hockey')

on conflict do nothing;