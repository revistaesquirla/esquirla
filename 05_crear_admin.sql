-- ══════════════════════════════════════════════════════════════
-- ESQUIRLA · 05 — Convertir tu usuario en administrador
--
-- ORDEN CORRECTO:
--   1. Supabase → Authentication → Users → "Add user"
--      → Create new user → correo + contraseña
--      → marca "Auto Confirm User"
--   2. Vuelve al SQL Editor, cambia el correo de abajo y ejecuta.
--
-- Sin este paso el login funciona pero /admin te rechaza:
-- el usuario existe, pero su rol es "reader".
-- ══════════════════════════════════════════════════════════════

update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'CAMBIA_ESTO@tucolegio.edu.co'   -- ← tu correo
);

-- Comprobación: debe devolver una fila con role = admin
select p.id, u.email, p.role
from public.profiles p
join auth.users u on u.id = p.id
where p.role = 'admin';
