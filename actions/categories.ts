'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import { categorySchema, toFieldErrors } from '@/lib/validators';
import { slugify } from '@/lib/utils';
import type { ActionResult } from '@/types/database';

export async function createCategory(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const parsed = categorySchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) {
    return { ok: false, error: 'Revisa el nombre.', fieldErrors: toFieldErrors(parsed.error) };
  }

  const name = parsed.data.name;
  const supabase = await createClient();
  const { error } = await supabase.from('categories').insert({ name, slug: slugify(name) });

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'Esa categoría ya existe.' };
    return { ok: false, error: 'No se pudo crear la categoría.' };
  }

  revalidatePath('/admin/configuracion');
  revalidatePath('/posts');
  return { ok: true, message: `Categoría "${name}" creada.` };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para eliminar categorías.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) return { ok: false, error: 'No se pudo eliminar la categoría.' };

  revalidatePath('/admin/configuracion');
  revalidatePath('/posts');
  return { ok: true, message: 'Categoría eliminada. Los posts que la usaban quedaron sin categoría.' };
}
