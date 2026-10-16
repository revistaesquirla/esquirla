'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import { toFieldErrors } from '@/lib/validators';
import { toInstant } from '@/lib/events';
import type { ActionResult, ContentStatus } from '@/types/database';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

const schema = z.object({
  title: z.string().trim().min(2, 'El título necesita al menos 2 caracteres.').max(140),
  description: z.string().trim().max(1500, 'Máximo 1500 caracteres.'),
  location: z.string().trim().max(160),
  date: z.string().regex(DATE_RE, 'Elige la fecha.'),
  end_date: z.string().refine((v) => v === '' || DATE_RE.test(v), 'Fecha inválida.'),
  start_time: z.string().refine((v) => v === '' || TIME_RE.test(v), 'Hora inválida.'),
  end_time: z.string().refine((v) => v === '' || TIME_RE.test(v), 'Hora inválida.'),
  status: z.enum(['draft', 'published', 'hidden']),
});

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '');
}

function parse(formData: FormData) {
  const parsed = schema.safeParse({
    title: text(formData, 'title'),
    description: text(formData, 'description'),
    location: text(formData, 'location'),
    date: text(formData, 'date'),
    end_date: text(formData, 'end_date'),
    start_time: text(formData, 'start_time'),
    end_time: text(formData, 'end_time'),
    status: text(formData, 'status'),
  });

  if (!parsed.success) {
    return {
      ok: false as const,
      result: {
        ok: false as const,
        error: 'Revisa los campos marcados.',
        fieldErrors: toFieldErrors(parsed.error),
      },
    };
  }

  const v = parsed.data;
  const allDay = formData.get('all_day') === 'on';
  const errors: Record<string, string[]> = {};

  let startsAt = toInstant(v.date, allDay ? '00:00' : v.start_time || '00:00');
  let endsAt: Date | null = null;

  if (Number.isNaN(startsAt.getTime())) {
    errors.date = ['Esa fecha no existe.'];
    startsAt = new Date();
  }

  if (allDay) {
    if (v.end_date) {
      if (v.end_date < v.date) errors.end_date = ['La fecha final no puede ser anterior al inicio.'];
      else endsAt = toInstant(v.end_date);
    }
  } else {
    if (!v.start_time) errors.start_time = ['Pon la hora de inicio o marca "Todo el día".'];
    if (v.end_time) {
      endsAt = toInstant(v.end_date || v.date, v.end_time);
      if (Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
        errors.end_time = ['El final debe ser después del inicio.'];
      }
    } else if (v.end_date) {
      errors.end_time = ['Si pones fecha final, pon también la hora final.'];
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false as const,
      result: { ok: false as const, error: 'Revisa los campos marcados.', fieldErrors: errors },
    };
  }

  return {
    ok: true as const,
    values: {
      title: v.title,
      description: v.description || null,
      location: v.location || null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt ? endsAt.toISOString() : null,
      all_day: allDay,
      status: v.status,
    },
  };
}

function refresh() {
  revalidatePath('/calendario');
  revalidatePath('/admin/fechas');
}

export async function createEvent(
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
    .from('events')
    .insert(parsed.values)
    .select('id')
    .single<{ id: string }>();

  if (error) return { ok: false, error: 'No se pudo guardar la fecha. Inténtalo de nuevo.' };

  refresh();
  redirect(`/admin/fechas/${data.id}?creada=1`);
}

export async function updateEvent(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const id = text(formData, 'id');
  if (!id) return { ok: false, error: 'Falta el identificador de la fecha.' };

  const parsed = parse(formData);
  if (!parsed.ok) return parsed.result;

  const supabase = await createClient();
  const { error } = await supabase.from('events').update(parsed.values).eq('id', id);
  if (error) return { ok: false, error: 'No se pudieron guardar los cambios.' };

  refresh();
  return { ok: true, message: 'Cambios guardados.' };
}

export async function setEventStatus(id: string, status: ContentStatus): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para publicar.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('events').update({ status }).eq('id', id);
  if (error) return { ok: false, error: 'No se pudo cambiar el estado.' };

  refresh();
  return { ok: true, message: status === 'published' ? 'Fecha publicada.' : 'Fecha despublicada.' };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para eliminar.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) return { ok: false, error: 'No se pudo eliminar la fecha.' };

  refresh();
  redirect('/admin/fechas?eliminada=1');
}