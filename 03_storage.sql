-- ══════════════════════════════════════════════════════════════
-- ESQUIRLA · 03 — Storage (buckets + políticas)
-- Ejecutar DESPUÉS de 02_policies.sql
--
-- Dos buckets:
--   media → imágenes, con carpetas covers/ posts/ gallery/
--   pdfs  → las revistas completas
--
-- Ambos son de lectura pública (cualquiera puede ver la revista)
-- pero solo un admin autenticado puede subir, reemplazar o borrar.
-- Los límites de tamaño y tipo los aplica el propio Supabase:
-- aunque alguien manipule el frontend, el servidor rechaza el archivo.
-- ══════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 8388608,
   array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']),
  ('pdfs', 'pdfs', true, 52428800,
   array['application/pdf'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lectura pública
drop policy if exists "esquirla lectura publica" on storage.objects;
create policy "esquirla lectura publica" on storage.objects
  for select using (bucket_id in ('media', 'pdfs'));

-- Escritura solo admin
drop policy if exists "esquirla admin sube" on storage.objects;
create policy "esquirla admin sube" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('media', 'pdfs') and public.is_admin());

drop policy if exists "esquirla admin reemplaza" on storage.objects;
create policy "esquirla admin reemplaza" on storage.objects
  for update to authenticated
  using (bucket_id in ('media', 'pdfs') and public.is_admin())
  with check (bucket_id in ('media', 'pdfs') and public.is_admin());

drop policy if exists "esquirla admin borra" on storage.objects;
create policy "esquirla admin borra" on storage.objects
  for delete to authenticated
  using (bucket_id in ('media', 'pdfs') and public.is_admin());
