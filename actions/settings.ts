'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import { settingsSchema, toFieldErrors } from '@/lib/validators';
import type { ActionResult } from '@/types/database';

export async function updateSettings(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const parsed = settingsSchema.safeParse({
    magazine_name: formData.get('magazine_name'),
    tagline: formData.get('tagline'),
    about_text: formData.get('about_text'),
    participa_text: formData.get('participa_text'),
    contact_email: formData.get('contact_email') ?? '',
    instagram: formData.get('instagram'),
  });

  if (!parsed.success) {
    return { ok: false, error: 'Revisa los campos.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('settings')
    .upsert({ id: true, ...parsed.data }, { onConflict: 'id' });

  if (error) return { ok: false, error: 'No se pudo guardar la configuración.' };

  revalidatePath('/', 'layout');
  return { ok: true, message: 'Configuración guardada.' };
}
