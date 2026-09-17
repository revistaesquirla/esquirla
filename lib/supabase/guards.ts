import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/database';

export type AdminSession = {
  userId: string;
  email: string | null;
  profile: Profile;
};

/**
 * Devuelve la sesión si el usuario es admin, o null si no lo es.
 * Lo usan el layout del panel y todas las server actions.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (!profile || profile.role !== 'admin') return null;

  return { userId: user.id, email: user.email ?? null, profile };
}

/** Lanza si quien llama no es admin. Para usar dentro de server actions. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('No tienes permiso para realizar esta acción.');
  }
  return session;
}
