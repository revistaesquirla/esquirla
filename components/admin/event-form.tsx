'use client';

import Link from 'next/link';
import { startTransition, useActionState, useState } from 'react';
import type { FormEvent } from 'react';
import { createEvent, deleteEvent, updateEvent } from '@/actions/events';
import { ConfirmAction } from '@/components/admin/confirm-action';
import { Feedback, Field } from '@/components/admin/ui';
import { toBogotaParts } from '@/lib/events';
import type { ActionResult } from '@/types/database';
import type { EventRow } from '@/types/events';

export function EventForm({ event }: { event?: EventRow }) {
  const action = event ? updateEvent : createEvent;
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null);
  const [allDay, setAllDay] = useState(event?.all_day ?? false);

  const start = event ? toBogotaParts(event.starts_at) : null;
  const end = event?.ends_at ? toBogotaParts(event.ends_at) : null;
  const errors = state && !state.ok ? state.fieldErrors : undefined;

  // Envío manual: así React no borra lo escrito si hay un error de validación.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}

      <div className="space-y-5">
        {state ? (
          <Feedback tone={state.ok ? 'ok' : 'error'}>
            {state.ok ? (state.message ?? 'Guardado.') : state.error}
          </Feedback>
        ) : null}

        <Field label="Título" htmlFor="title" errors={errors?.title}>
          <input
            id="title"
            name="title"
            required
            defaultValue={event?.title ?? ''}
            className="campo"
            placeholder="Cierre de inscripciones, lanzamiento de la edición 02…"
          />
        </Field>

        <Field label="Lugar" htmlFor="location" hint="Opcional." errors={errors?.location}>
          <input id="location" name="location" defaultValue={event?.location ?? ''} className="campo" />
        </Field>

        <Field
          label="Descripción"
          htmlFor="description"
          hint="Opcional. Se copia al calendario de quien la agregue."
          errors={errors?.description}
        >
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={event?.description ?? ''}
            className="campo resize-y"
          />
        </Field>
      </div>

      <aside className="space-y-6">
        <div className="marco space-y-5 p-5">
          <label className="flex items-start gap-3 border-2 border-carbon p-3">
            <input
              type="checkbox"
              name="all_day"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[#E02118]"
            />
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em]">Todo el día</span>
          </label>

          <Field label="Fecha" htmlFor="date" errors={errors?.date}>
            <input id="date" name="date" type="date" required defaultValue={start?.date ?? ''} className="campo" />
          </Field>

          {!allDay ? (
            <Field label="Hora de inicio" htmlFor="start_time" errors={errors?.start_time}>
              <input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={event && !event.all_day ? (start?.time ?? '') : ''}
                className="campo"
              />
            </Field>
          ) : null}

          <Field
            label="Fecha final"
            htmlFor="end_date"
            hint="Solo si dura más de un día."
            errors={errors?.end_date}
          >
            <input id="end_date" name="end_date" type="date" defaultValue={end?.date ?? ''} className="campo" />
          </Field>

          {!allDay ? (
            <Field label="Hora final" htmlFor="end_time" hint="Opcional." errors={errors?.end_time}>
              <input
                id="end_time"
                name="end_time"
                type="time"
                defaultValue={event && !event.all_day && end ? end.time : ''}
                className="campo"
              />
            </Field>
          ) : null}

          <p className="text-xs text-carbon/55">Todas las horas son hora de Colombia.</p>
        </div>

        <div className="marco p-5">
          <Field label="Estado" htmlFor="status">
            <select id="status" name="status" defaultValue={event?.status ?? 'draft'} className="campo">
              <option value="draft">Borrador — nadie la ve</option>
              <option value="published">Publicada — visible en Calendario</option>
              <option value="hidden">Oculta — retirada del sitio</option>
            </select>
          </Field>
        </div>

        <div className="space-y-3">
          <button type="submit" disabled={pending} aria-busy={pending} className="boton w-full">
            {pending ? 'Guardando…' : event ? 'Guardar cambios' : 'Crear fecha'}
          </button>
          {event ? (
            <Link href="/calendario" target="_blank" className="boton-fantasma w-full px-3 py-2">
              Ver el calendario
            </Link>
          ) : null}
        </div>

        {event ? (
          <div className="border-t-2 border-carbon pt-5">
            <ConfirmAction
              action={() => deleteEvent(event.id)}
              label="Eliminar fecha"
              question="¿Seguro que quieres eliminar esta fecha?"
            />
          </div>
        ) : null}
      </aside>
    </form>
  );
}