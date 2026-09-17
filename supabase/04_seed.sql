-- ══════════════════════════════════════════════════════════════
-- ESQUIRLA · 04 — Datos iniciales
-- Ejecutar DESPUÉS de 03_storage.sql
--
-- Las categorías son reales y las vas a usar.
-- La edición y los posts están marcados como DEMO: bórralos desde
-- el panel en cuanto tengas tu primera edición de verdad.
-- ══════════════════════════════════════════════════════════════

insert into public.categories (name, slug, description) values
  ('ESCENA',  'escena',  'Lo que pasa en el escenario, la cancha y el patio.'),
  ('RUIDO',   'ruido',   'Música, playlists, recomendaciones.'),
  ('RETRATO', 'retrato', 'Personas del colegio, contadas de cerca.'),
  ('PASILLO', 'pasillo', 'Lo cotidiano entre clase y clase.'),
  ('CRÓNICA', 'cronica', 'Historias largas, narradas con calma.'),
  ('CAOS',    'caos',    'Humor, experimentos y cosas sin categoría.'),
  ('OPINIÓN', 'opinion', 'Lo que pensamos y por qué.')
on conflict (slug) do nothing;

insert into public.settings (id, magazine_name, tagline, contact_email)
values (true, 'ESQUIRLA', 'Una revista hecha por estudiantes.', null)
on conflict (id) do nothing;

-- ── Edición DEMO ──────────────────────────────────────────────
-- Sin portada ni PDF: los subes tú desde /admin/ediciones/nueva.
insert into public.editions
  (issue_number, year, title, subtitle, description, status, featured, published_at)
values
  (1, 2026, 'EL ESCENARIO', 'DEMO · contenido de ejemplo',
   'Presentaciones, historias y todo aquello que ocurrió cuando se apagaron las luces. (Esta edición es una DEMO para que veas cómo se ve el sitio. Reemplázala por la tuya.)',
   'published', true, now())
on conflict (issue_number) do nothing;

-- ── Post DEMO ─────────────────────────────────────────────────
insert into public.posts
  (title, slug, subtitle, excerpt, content_html, content, author, category_id, status, featured, published_at)
select
  'DEMO · Día del Idioma 2025',
  'demo-dia-del-idioma-2025',
  'Contenido de ejemplo, no es un artículo terminado',
  'Ejemplo de post para probar el panel. Reemplázalo por un artículo real.',
  '<p>Este post es <strong>contenido DEMO</strong>. Existe solo para que compruebes que el panel guarda, publica y muestra artículos.</p><p>Dato real disponible como punto de partida editorial: durante el Día del Idioma de 2025, la promoción 2025 realizó una presentación de baile/remix con una representación inspirada en Shrek, en la que participó toda la promoción.</p><blockquote><p>Escribe aquí el artículo real y borra este post desde el panel.</p></blockquote>',
  null,
  'Redacción ESQUIRLA (DEMO)',
  (select id from public.categories where slug = 'escena'),
  'published',
  true,
  now()
where not exists (select 1 from public.posts where slug = 'demo-dia-del-idioma-2025');

-- ── Fragmentos DEMO ───────────────────────────────────────────
insert into public.fragments (kind, body, attribution, status, position)
select 'quote', 'Una esquirla es un pedazo que salta cuando algo se rompe. Esto es eso: pedazos del colegio.', 'DEMO', 'published', 1
where not exists (select 1 from public.fragments where attribution = 'DEMO' and position = 1);

insert into public.fragments (kind, body, attribution, status, position)
select 'quote', 'Nada de esto cabía en una cartelera.', 'DEMO', 'published', 2
where not exists (select 1 from public.fragments where attribution = 'DEMO' and position = 2);
