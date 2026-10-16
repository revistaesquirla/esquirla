'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import { fragmentSchema, toFieldErrors } from '@/lib/validators';
import { MEDIA_BUCKET } from '@/lib/constants';
import { parseVideoUrl } from '@/lib/video';
import type { ActionResult, ContentStatus, Fragment } from '@/types/database';

export type FragmentMove = 'up' | 'down' | 'top' | 'bottom';

function readForm(formData: FormData) {
  return {
    kind: formData.get('kind'),
    body: formData.get('body'),
    attribution: formData.get('attribution'),
    image_path: formData.get('image_path'),
    image_url: formData.get('image_url'),
    video_url: formData.get('video_url'),
    post_id: formData.get('post_id') || null,
    status: formData.get('status'),
    position: formData.get('position') || 0,
  };
}

function refreshPages() {
  revalidatePath('/');
  revalidatePath('/admin/fragmentos');
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

  const { kind, body, attribution, image_path, image_url, video_url, post_id, status } = parsed.data;

  if (kind !== 'photo' && kind !== 'video' && !body) {
    return { ok: false, error: 'Escribe el texto del fragmento.' };
  }
  if (kind === 'photo' && !image_url) {
    return { ok: false, error: 'Sube una fotografía para este fragmento.' };
  }
  if (kind === 'video' && !parseVideoUrl(video_url)) {
    return { ok: false, error: 'Pega un enlace válido de YouTube, Vimeo o Instagram.' };
  }

  const content = {
    kind,
    body,
    attribution,
    image_path,
    image_url,
    video_url: kind === 'video' ? video_url : null,
    post_id,
    status,
  };

  const id = String(formData.get('id') ?? '');
  const supabase = await createClient();

  if (id) {
    const { error } = await supabase.from('fragments').update(content).eq('id', id);
    if (error) return { ok: false, error: 'No se pudo guardar el fragmento.' };
  } else {
    // Los nuevos siempre entran al final; el orden se cambia con las flechas.
    const { data: last } = await supabase
      .from('fragments')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle<{ position: number }>();

    const { error } = await supabase
      .from('fragments')
      .insert({ ...content, position: (last?.position ?? -1) + 1 });
    if (error) {
      return {
        ok: false,
        error: 'No se pudo guardar el fragmento. Si es un video, ¿ejecutaste 09_videos.sql?',
      };
    }
  }

  refreshPages();
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

  refreshPages();
  return { ok: true, message: 'Fragmento eliminado.' };
}

export async function setFragmentStatus(id: string, status: ContentStatus): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para cambiar el estado.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('fragments').update({ status }).eq('id', id);
  if (error) return { ok: false, error: 'No se pudo cambiar el estado del fragmento.' };

  refreshPages();
  return { ok: true };
}

/**
 * Mueve un fragmento y renumera TODA la lista (0, 1, 2…).
 * Así funciona aunque varios tuvieran la misma posición.
 */
export async function reorderFragment(id: string, move: FragmentMove): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para reordenar.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('fragments')
    .select('id, position')
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error || !data) return { ok: false, error: 'No se pudo leer el orden actual.' };

  const ids: string[] = data.map((fragment) => fragment.id);
  const from = ids.indexOf(id);
  if (from === -1) return { ok: false, error: 'Ese fragmento ya no existe.' };

  ids.splice(from, 1);
  const to =
    move === 'top'
      ? 0
      : move === 'bottom'
        ? ids.length
        : move === 'up'
          ? Math.max(0, from - 1)
          : Math.min(ids.length, from + 1);
  ids.splice(to, 0, id);

  const previous = new Map<string, number>(data.map((fragment) => [fragment.id, fragment.position]));
  const changes = ids
    .map((fragmentId, position) => ({ fragmentId, position }))
    .filter(({ fragmentId, position }) => previous.get(fragmentId) !== position);

  if (changes.length === 0) return { ok: true };

  const results = await Promise.all(
    changes.map(({ fragmentId, position }) =>
      supabase.from('fragments').update({ position }).eq('id', fragmentId),
    ),
  );

  if (results.some((result) => result.error)) {
    return { ok: false, error: 'No se pudo reordenar los fragmentos.' };
  }

  refreshPages();
  return { ok: true };
}