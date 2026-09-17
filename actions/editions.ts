'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import { editionSchema, toFieldErrors } from '@/lib/validators';
import { MEDIA_BUCKET, PDF_BUCKET } from '@/lib/constants';
import type { ActionResult, ContentStatus, Edition } from '@/types/database';

function readForm(formData: FormData) {
  return {
    issue_number: formData.get('issue_number'),
    year: formData.get('year'),
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    description: formData.get('description'),
    cover_path: formData.get('cover_path'),
    cover_url: formData.get('cover_url'),
    pdf_path: formData.get('pdf_path'),
    pdf_url: formData.get('pdf_url'),
    pdf_size: formData.get('pdf_size') || null,
    status: formData.get('status'),
    featured: formData.get('featured') === 'on' || formData.get('featured') === 'true',
    published_at: formData.get('published_at'),
  };
}

function revalidateEditions(id?: string) {
  revalidatePath('/');
  revalidatePath('/ediciones');
  revalidatePath('/admin');
  revalidatePath('/admin/ediciones');
  if (id) {
    revalidatePath(`/ediciones/${id}`);
    revalidatePath(`/leer/${id}`);
  }
}

export async function createEdition(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const parsed = editionSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revisa los campos marcados.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const values = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('editions')
    .insert({
      ...values,
      published_at: resolvePublishedAt(values.published_at, values.status, null),
    })
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === '23505') {
      return {
        ok: false,
        error: `Ya existe una edición con el número ${values.issue_number}.`,
        fieldErrors: { issue_number: ['Este número ya está en uso.'] },
      };
    }
    return { ok: false, error: 'No se pudo guardar la edición. Inténtalo de nuevo.' };
  }

  revalidateEditions(data.id);
  redirect(`/admin/ediciones/${data.id}?creada=1`);
}

export async function updateEdition(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const id = String(formData.get('id') ?? '');
  if (!id) return { ok: false, error: 'Falta el identificador de la edición.' };

  const parsed = editionSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revisa los campos marcados.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const values = parsed.data;
  const supabase = await createClient();

  const { data: current } = await supabase
    .from('editions')
    .select('published_at, cover_path, pdf_path')
    .eq('id', id)
    .maybeSingle<Pick<Edition, 'published_at' | 'cover_path' | 'pdf_path'>>();

  const { error } = await supabase
    .from('editions')
    .update({
      ...values,
      published_at: resolvePublishedAt(values.published_at, values.status, current?.published_at ?? null),
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return {
        ok: false,
        error: `Ya existe una edición con el número ${values.issue_number}.`,
        fieldErrors: { issue_number: ['Este número ya está en uso.'] },
      };
    }
    return { ok: false, error: 'No se pudieron guardar los cambios.' };
  }

  // Si se reemplazó la portada o el PDF, el archivo viejo queda huérfano.
  await removeReplacedFiles(current, values.cover_path, values.pdf_path);

  revalidateEditions(id);
  return { ok: true, message: 'Cambios guardados.' };
}

export async function setEditionStatus(id: string, status: ContentStatus): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para publicar.' };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from('editions')
    .select('published_at')
    .eq('id', id)
    .maybeSingle<{ published_at: string | null }>();

  const { error } = await supabase
    .from('editions')
    .update({
      status,
      published_at:
        status === 'published' ? (current?.published_at ?? new Date().toISOString()) : current?.published_at ?? null,
    })
    .eq('id', id);

  if (error) return { ok: false, error: 'No se pudo cambiar el estado de la edición.' };

  revalidateEditions(id);
  return {
    ok: true,
    message: status === 'published' ? 'Edición publicada.' : 'Edición despublicada.',
  };
}

export async function setFeaturedEdition(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para destacar ediciones.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('editions').update({ featured: true }).eq('id', id);

  if (error) return { ok: false, error: 'No se pudo destacar la edición.' };

  revalidateEditions(id);
  return { ok: true, message: 'Esta edición ahora abre la portada del sitio.' };
}

export async function deleteEdition(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para eliminar.' };
  }

  const supabase = await createClient();

  const { data: edition } = await supabase
    .from('editions')
    .select('cover_path, pdf_path')
    .eq('id', id)
    .maybeSingle<Pick<Edition, 'cover_path' | 'pdf_path'>>();

  const { error } = await supabase.from('editions').delete().eq('id', id);
  if (error) return { ok: false, error: 'No se pudo eliminar la edición.' };

  if (edition?.cover_path) await supabase.storage.from(MEDIA_BUCKET).remove([edition.cover_path]);
  if (edition?.pdf_path) await supabase.storage.from(PDF_BUCKET).remove([edition.pdf_path]);

  revalidateEditions(id);
  redirect('/admin/ediciones?eliminada=1');
}

/** Guarda el número de páginas que detectó el lector la primera vez. */
export async function saveEditionPageCount(id: string, pageCount: number): Promise<void> {
  if (!Number.isInteger(pageCount) || pageCount < 1) return;
  const supabase = await createClient();
  await supabase.from('editions').update({ page_count: pageCount }).eq('id', id).is('page_count', null);
}

// ── helpers ───────────────────────────────────────────────────

function resolvePublishedAt(
  formValue: string | null | undefined,
  status: ContentStatus,
  currentValue: string | null,
) {
  if (formValue) return new Date(formValue).toISOString();
  if (currentValue) return currentValue;
  return status === 'published' ? new Date().toISOString() : null;
}

async function removeReplacedFiles(
  current: { cover_path: string | null; pdf_path: string | null } | null | undefined,
  nextCover: string | null | undefined,
  nextPdf: string | null | undefined,
) {
  if (!current) return;
  const supabase = await createClient();

  if (current.cover_path && current.cover_path !== nextCover) {
    await supabase.storage.from(MEDIA_BUCKET).remove([current.cover_path]);
  }
  if (current.pdf_path && current.pdf_path !== nextPdf) {
    await supabase.storage.from(PDF_BUCKET).remove([current.pdf_path]);
  }
}
