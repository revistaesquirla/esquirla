'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import { fragmentSchema, toFieldErrors } from '@/lib/validators';
import { MEDIA_BUCKET } from '@/lib/constants';
import type { ActionResult, Fragment } from '@/types/database';

function readForm(formData: FormData) {
  return {
    kind: formData.get('kind'),
    body: formData.get('body'),
    attribution: formData.get('attribution'),
    image_path: formData.get('image_path'),
    image_url: formData.get('image_url'),
    post_id: formData.get('post_id') || null,
    status: formData.get('status'),
    position: formData.get('position') || 0,
  };
}

export async function saveFragment(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const parsed = fragmentSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, error: 'Revisa los campos.', fieldErrors: toFieldErrors(parsed.error) };
  }

  if (parsed.data.kind !== 'photo' && !parsed.data.body) {
    return { ok: false, error: 'Escribe el texto del fragmento.' };
  }
  if (parsed.data.kind === 'photo' && !parsed.data.image_url) {
    return { ok: false, error: 'Sube una fotografía para este fragmento.' };
  }

  const id = String(formData.get('id') ?? '');
  const supabase = await createClient();

  const { error } = id
    ? await supabase.from('fragments').update(parsed.data).eq('id', id)
    : await supabase.from('fragments').insert(parsed.data);

  if (error) return { ok: false, error: 'No se pudo guardar el fragmento.' };

  revalidatePath('/');
  revalidatePath('/admin/fragmentos');
  return { ok: true, message: id ? 'Fragmento actualizado.' : 'Fragmento creado.' };
}

export async function deleteFragment(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para eliminar.' };
  }

  const supabase = await createClient();
  const { data: fragment } = await supabase
    .from('fragments')
    .select('image_path')
    .eq('id', id)
    .maybeSingle<Pick<Fragment, 'image_path'>>();

  const { error } = await supabase.from('fragments').delete().eq('id', id);
  if (error) return { ok: false, error: 'No se pudo eliminar el fragmento.' };

  if (fragment?.image_path) await supabase.storage.from(MEDIA_BUCKET).remove([fragment.image_path]);

  revalidatePath('/');
  revalidatePath('/admin/fragmentos');
  return { ok: true, message: 'Fragmento eliminado.' };
}
