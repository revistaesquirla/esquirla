'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import { MEDIA_BUCKET } from '@/lib/constants';
import { isHttpUrl } from '@/lib/links';
import { slugify } from '@/lib/utils';
import type { ActionResult } from '@/types/database';
import type { LinkButton } from '@/types/links';

const MAX_BUTTONS = 4;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '');
}

function parse(formData: FormData) {
  const errors: Record<string, string[]> = {};
  const add = (key: string, message: string) => {
    errors[key] = [...(errors[key] ?? []), message];
  };

  const label = text(formData, 'label').trim();
  const mode: 'redirect' | 'menu' = text(formData, 'mode') === 'menu' ? 'menu' : 'redirect';
  const slug = slugify(text(formData, 'slug').trim() || label);
  const targetUrl = text(formData, 'target_url').trim();
  const pageTitle = text(formData, 'page_title').trim();
  const pageMessage = text(formData, 'page_message').trim();
  const ogTitle = text(formData, 'og_title').trim();
  const ogDescription = text(formData, 'og_description').trim();
  const ogImagePath = text(formData, 'og_image_path').trim();
  const ogImageUrl = text(formData, 'og_image_url').trim();

  if (label.length < 2) add('label', 'Ponle un nombre para reconocerlo (mínimo 2 letras).');
  if (label.length > 100) add('label', 'El nombre es demasiado largo (máximo 100).');
  if (slug.length < 2) add('slug', 'La dirección necesita al menos 2 caracteres.');
  if (slug.length > 60) add('slug', 'La dirección es demasiado larga (máximo 60).');

  const buttons: LinkButton[] = [];

  if (mode === 'redirect') {
    if (!targetUrl) add('target_url', 'Pega la dirección a la que debe llevar.');
    else if (targetUrl.length > 800) add('target_url', 'La dirección es demasiado larga.');
    else if (!isHttpUrl(targetUrl)) {
      add('target_url', 'Debe ser una dirección completa que empiece por https://');
    }
  } else {
    if (pageTitle.length < 2) add('page_title', 'Escribe el título de la página.');
    if (pageTitle.length > 120) add('page_title', 'El título es demasiado largo (máximo 120).');
    if (pageMessage.length > 1500) add('page_message', 'El mensaje es demasiado largo (máximo 1500).');

    for (let i = 1; i <= MAX_BUTTONS; i += 1) {
      const buttonLabel = text(formData, `button_label_${i}`).trim();
      const buttonUrl = text(formData, `button_url_${i}`).trim();
      if (!buttonLabel && !buttonUrl) continue;

      if (!buttonLabel) add(`button_label_${i}`, 'Pon el texto del botón.');
      if (buttonLabel.length > 60) add(`button_label_${i}`, 'Texto demasiado largo (máximo 60).');
      if (!buttonUrl) add(`button_url_${i}`, 'Pon la dirección del botón.');
      else if (buttonUrl.length > 800 || !isHttpUrl(buttonUrl)) {
        add(`button_url_${i}`, 'Debe ser una dirección completa que empiece por https://');
      }
      buttons.push({ label: buttonLabel, url: buttonUrl });
    }
  }

  if (ogTitle.length > 100) add('og_title', 'El título es demasiado largo (máximo 100).');
  if (ogDescription.length > 300) add('og_description', 'La descripción es demasiado larga (máximo 300).');
  if (ogImageUrl && !isHttpUrl(ogImageUrl)) add('og_image', 'La imagen no es válida. Súbela de nuevo.');

  if (Object.keys(errors).length > 0) {
    return {
      ok: false as const,
      result: { ok: false as const, error: 'Revisa los campos marcados.', fieldErrors: errors },
    };
  }

  return {
    ok: true as const,
    values: {
      label,
      slug,
      mode,
      target_url: mode === 'redirect' ? targetUrl : null,
      page_title: mode === 'menu' ? pageTitle : null,
      page_message: mode === 'menu' ? pageMessage || null : null,
      buttons,
      og_title: ogTitle || null,
      og_description: ogDescription || null,
      og_image_path: ogImagePath || null,
      og_image_url: ogImageUrl || null,
      active: formData.get('active') === 'on',
    },
  };
}

function refresh() {
  revalidatePath('/admin/vinculos');
}

export async function createLink(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const parsed = parse(formData);
  if (!parsed.ok) return parsed.result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('links')
    .insert(parsed.values)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === '23505') {
      return {
        ok: false,
        error: 'Ya existe un vínculo con esa dirección.',
        fieldErrors: { slug: ['Esa dirección ya está ocupada. Cámbiala.'] },
      };
    }
    return { ok: false, error: 'No se pudo guardar el vínculo. ¿Ejecutaste 08_vinculos.sql?' };
  }

  refresh();
  redirect(`/admin/vinculos/${data.id}?creado=1`);
}

export async function updateLink(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const id = text(formData, 'id');
  if (!id) return { ok: false, error: 'Falta el identificador del vínculo.' };

  const parsed = parse(formData);
  if (!parsed.ok) return parsed.result;

  const supabase = await createClient();
  const { data: current } = await supabase
    .from('links')
    .select('og_image_path')
    .eq('id', id)
    .maybeSingle<{ og_image_path: string | null }>();

  const { error } = await supabase.from('links').update(parsed.values).eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return {
        ok: false,
        error: 'Ya existe un vínculo con esa dirección.',
        fieldErrors: { slug: ['Esa dirección ya está ocupada. Cámbiala.'] },
      };
    }
    return { ok: false, error: 'No se pudieron guardar los cambios.' };
  }

  if (current?.og_image_path && current.og_image_path !== parsed.values.og_image_path) {
    await supabase.storage.from(MEDIA_BUCKET).remove([current.og_image_path]);
  }

  refresh();
  return { ok: true, message: 'Cambios guardados.' };
}

export async function toggleLink(id: string, active: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para cambiar el estado.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('links').update({ active }).eq('id', id);
  if (error) return { ok: false, error: 'No se pudo cambiar el estado del vínculo.' };

  refresh();
  return { ok: true };
}

export async function deleteLink(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para eliminar.' };
  }

  const supabase = await createClient();
  const { data: link } = await supabase
    .from('links')
    .select('og_image_path')
    .eq('id', id)
    .maybeSingle<{ og_image_path: string | null }>();

  const { error } = await supabase.from('links').delete().eq('id', id);
  if (error) return { ok: false, error: 'No se pudo eliminar el vínculo.' };

  if (link?.og_image_path) await supabase.storage.from(MEDIA_BUCKET).remove([link.og_image_path]);

  refresh();
  redirect('/admin/vinculos?eliminado=1');
}

/** Pública: suma una apertura al contador. Nunca debe romper la página. */
export async function trackLinkClick(slug: string): Promise<void> {
  if (!slug || slug.length > 80) return;
  try {
    const supabase = await createClient();
    await supabase.rpc('register_link_click', { p_slug: slug });
  } catch {
    // Un contador que falla no debe afectar a quien abre el enlace.
  }
}