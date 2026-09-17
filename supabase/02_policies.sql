-- ══════════════════════════════════════════════════════════════
-- ESQUIRLA · 02 — Row Level Security
-- Ejecutar DESPUÉS de 01_schema.sql
--
-- Regla general:
--   · Público  → solo lee lo que está en estado "published".
--   · Admin    → lee y escribe todo.
-- Sin estas políticas, RLS activo bloquea absolutamente todo.
-- ══════════════════════════════════════════════════════════════

alter table public.profiles   enable row level security;
alter table public.categories enable row level security;
alter table public.editions   enable row level security;
alter table public.posts      enable row level security;
alter table public.fragments  enable row level security;
alter table public.settings   enable row level security;

-- ── PROFILES ──────────────────────────────────────────────────
drop policy if exists "perfil propio o admin" on public.profiles;
create policy "perfil propio o admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "admin edita perfiles" on public.profiles;
create policy "admin edita perfiles" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- ── CATEGORÍAS ────────────────────────────────────────────────
drop policy if exists "categorias visibles" on public.categories;
create policy "categorias visibles" on public.categories
  for select using (true);

drop policy if exists "admin gestiona categorias" on public.categories;
create policy "admin gestiona categorias" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ── EDICIONES ─────────────────────────────────────────────────
drop policy if exists "ediciones publicadas son publicas" on public.editions;
create policy "ediciones publicadas son publicas" on public.editions
  for select using (status = 'published' or public.is_admin());

drop policy if exists "admin gestiona ediciones" on public.editions;
create policy "admin gestiona ediciones" on public.editions
  for all using (public.is_admin()) with check (public.is_admin());

-- ── POSTS ─────────────────────────────────────────────────────
drop policy if exists "posts publicados son publicos" on public.posts;
create policy "posts publicados son publicos" on public.posts
  for select using (status = 'published' or public.is_admin());

drop policy if exists "admin gestiona posts" on public.posts;
create policy "admin gestiona posts" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ── FRAGMENTOS ────────────────────────────────────────────────
drop policy if exists "fragmentos publicados son publicos" on public.fragments;
create policy "fragmentos publicados son publicos" on public.fragments
  for select using (status = 'published' or public.is_admin());

drop policy if exists "admin gestiona fragmentos" on public.fragments;
create policy "admin gestiona fragmentos" on public.fragments
  for all using (public.is_admin()) with check (public.is_admin());

-- ── CONFIGURACIÓN ─────────────────────────────────────────────
drop policy if exists "configuracion visible" on public.settings;
create policy "configuracion visible" on public.settings
  for select using (true);

drop policy if exists "admin edita configuracion" on public.settings;
create policy "admin edita configuracion" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());
