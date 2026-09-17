-- ══════════════════════════════════════════════════════════════
-- ESQUIRLA · 01 — Esquema de base de datos
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- Este archivo es idempotente: puedes volver a ejecutarlo.
-- ══════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Estado de publicación compartido por ediciones, posts y fragmentos
do $$
begin
  create type public.content_status as enum ('draft', 'published', 'hidden');
exception
  when duplicate_object then null;
end
$$;

-- ── PERFILES ──────────────────────────────────────────────────
-- Una fila por usuario de auth.users. El rol decide quién entra al panel.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        text not null default 'reader' check (role in ('admin', 'reader')),
  created_at  timestamptz not null default now()
);

-- ── CATEGORÍAS ────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

-- ── EDICIONES ─────────────────────────────────────────────────
create table if not exists public.editions (
  id            uuid primary key default gen_random_uuid(),
  issue_number  integer not null unique,
  year          integer not null,
  title         text not null,
  subtitle      text,
  description   text,
  cover_path    text,          -- ruta dentro del bucket "media"
  cover_url     text,          -- URL pública cacheada
  pdf_path      text,          -- ruta dentro del bucket "pdfs"
  pdf_url       text,
  pdf_size      bigint,        -- bytes
  page_count    integer,       -- lo rellena el lector la primera vez
  status        public.content_status not null default 'draft',
  featured      boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists editions_status_idx on public.editions (status, issue_number desc);
create index if not exists editions_featured_idx on public.editions (featured) where featured;

-- ── POSTS ─────────────────────────────────────────────────────
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  subtitle      text,
  excerpt       text,
  content       jsonb,         -- documento TipTap (fuente de verdad para editar)
  content_html  text,          -- HTML ya renderizado (para leer rápido)
  cover_path    text,
  cover_url     text,
  author        text,
  category_id   uuid references public.categories (id) on delete set null,
  edition_id    uuid references public.editions (id) on delete set null,
  status        public.content_status not null default 'draft',
  featured      boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists posts_status_idx on public.posts (status, published_at desc);
create index if not exists posts_category_idx on public.posts (category_id);

-- ── FRAGMENTOS ────────────────────────────────────────────────
-- La sección FRAGMENTOS de la home: frases, fotos y extractos reales.
create table if not exists public.fragments (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null default 'quote' check (kind in ('quote', 'photo', 'excerpt')),
  body         text,
  attribution  text,
  image_path   text,
  image_url    text,
  post_id      uuid references public.posts (id) on delete set null,
  edition_id   uuid references public.editions (id) on delete set null,
  status       public.content_status not null default 'draft',
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists fragments_status_idx on public.fragments (status, position);

-- ── CONFIGURACIÓN DE LA REVISTA ───────────────────────────────
-- Tabla de una sola fila (el check obliga a que id sea siempre true).
create table if not exists public.settings (
  id             boolean primary key default true check (id),
  magazine_name  text not null default 'ESQUIRLA',
  tagline        text,
  about_text     text,
  participa_text text,
  contact_email  text,
  instagram      text,
  updated_at     timestamptz not null default now()
);

-- ── TRIGGERS ──────────────────────────────────────────────────

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists editions_touch on public.editions;
create trigger editions_touch before update on public.editions
  for each row execute function public.touch_updated_at();

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

drop trigger if exists fragments_touch on public.fragments;
create trigger fragments_touch before update on public.fragments
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- Solo puede haber una edición destacada a la vez.
create or replace function public.enforce_single_featured_edition()
returns trigger
language plpgsql
as $$
begin
  if new.featured then
    update public.editions set featured = false
    where featured and id <> new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists editions_single_featured on public.editions;
create trigger editions_single_featured after insert or update of featured on public.editions
  for each row when (new.featured) execute function public.enforce_single_featured_edition();

-- Cada usuario nuevo de auth.users recibe su fila en profiles (rol "reader").
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── HELPER DE PERMISOS ────────────────────────────────────────
-- security definer = ignora RLS al leer profiles, así evitamos recursión
-- infinita en las políticas que consultan esta misma tabla.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;
