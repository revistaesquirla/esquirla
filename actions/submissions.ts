'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types/database';
import type { Submission } from '@/types/submissions';

const TOPICS = ['Fotografías', 'Una historia', 'Ilustraciones', 'Música', 'Una entrevista', 'Ayudar con una edición', 'Otro'];

const consent = z.literal('on', {
  errorMap: () => ({ message: 'Debes aceptar para poder enviarlo.' }),
});

const fragmentSchema = z.object({
  name: z.string().trim().max(80),
  body: z.string().trim().min(5, 'Escribe al menos unas palabras.').max(400, 'Máximo 400 caracteres.'),
  consent,
});

const participaSchema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre.').max(80),
  contact: z.string().trim().min(3, 'Déjanos un correo o tu Instagram.').max(160),
  topic: z.enum(TOPICS as [string, ...string[]], { errorMap: () => ({ message: 'Elige un tema.' }) }),
  body: z.string().trim().min(10, 'Cuéntanos un poco más.').max(2000, 'Máximo 2000 caracteres.'),
  consent,
});

function field(formData: FormData, key: string) {
  return String(formData.get(key) ?? '');
}

function fieldErrors(error: z.ZodError) {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    out[key] = [...(out[key] ?? []), issue.message];
  }
  return out;
}

const THANKS = 'Recibido. El equipo lo revisará pronto.';

export async function submitFragment(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // Campo trampa: los bots lo llenan, las personas no lo ven.
  if (field(formData, 'website')) return { ok: true, message: THANKS };

  const parsed = fragmentSchema.safeParse({
    name: field(formData, 'name'),
    body: field(formData, 'body'),
    consent: formData.get('consent') ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('submissions').insert({
    kind: 'fragment',
    name: parsed.data.name || null,
    body: parsed.data.body,
    status: 'pending',
  });

  if (error) return { ok: false, error: 'No se pudo enviar. Inténtalo de nuevo en un momento.' };
  return { ok: true, message: THANKS };
}

export async function submitParticipa(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  if (field(formData, 'website')) return { ok: true, message: THANKS };

  const parsed = participaSchema.safeParse({
    name: field(formData, 'name'),
    contact: field(formData, 'contact'),
    topic: field(formData, 'topic'),
    body: field(formData, 'body'),
    consent: formData.get('consent') ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: 'Revisa los campos marcados.', fieldErrors: fieldErrors(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('submissions').insert({
    kind: 'participa',
    name: parsed.data.name,
    contact: parsed.data.contact,
    topic: parsed.data.topic,
    body: parsed.data.body,
    status: 'pending',
  });

  if (error) return { ok: false, error: 'No se pudo enviar. Inténtalo de nuevo en un momento.' };
  return { ok: true, message: THANKS };
}

// ── Panel (solo administradores) ──────────────────────────────

function revalidateAll() {
  revalidatePath('/');
  revalidatePath('/admin/solicitudes');
  revalidatePath('/admin/fragmentos');
}

export async function approveSubmission(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para aprobar.' };
  }

  const supabase = await createClient();
  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle<Submission>();

  if (!submission) return { ok: false, error: 'Esa solicitud ya no existe.' };

  if (submission.kind === 'fragment') {
    const { data: last } = await supabase
      .from('fragments')
      .select('position')
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle<{ position: number }>();

    const { error: insertError } = await supabase.from('fragments').insert({
      kind: 'quote',
      body: submission.body,
      attribution: submission.name || 'Anónimo',
      status: 'published',
      position: (last?.position ?? -1) + 1,
    });

    if (insertError) return { ok: false, error: 'No se pudo publicar el fragmento.' };
  }

  const { error } = await supabase.from('submissions').update({ status: 'approved' }).eq('id', id);
  if (error) return { ok: false, error: 'No se pudo marcar como aprobada.' };

  revalidateAll();
  return {
    ok: true,
    message: submission.kind === 'fragment' ? 'Fragmento publicado en la portada.' : 'Solicitud aceptada.',
  };
}

export async function rejectSubmission(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para descartar.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('submissions').update({ status: 'rejected' }).eq('id', id);
  if (error) return { ok: false, error: 'No se pudo descartar la solicitud.' };

  revalidateAll();
  return { ok: true, message: 'Solicitud descartada.' };
}

export async function deleteSubmission(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para eliminar.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('submissions').delete().eq('id', id);
  if (error) return { ok: false, error: 'No se pudo eliminar la solicitud.' };

  revalidateAll();
  return { ok: true, message: 'Solicitud eliminada.' };
}