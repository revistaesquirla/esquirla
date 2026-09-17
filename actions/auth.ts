'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/database';

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/admin');

  if (!email || !password) {
    return { ok: false, error: 'Escribe tu correo y tu contraseña.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle<{ role: string }>();

  if (profile?.role !== 'admin') {
    await supabase.auth.signOut();
    return {
      ok: false,
      error: 'Esta cuenta existe pero no tiene permisos de administrador.',
    };
  }

  revalidatePath('/', 'layout');
  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/admin/login');
}
