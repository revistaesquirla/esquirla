'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { createEdition, deleteEdition, updateEdition } from '@/actions/editions';
import { ConfirmAction } from '@/components/admin/confirm-action';
import { ImageUploader, PdfUploader, type UploadedFile } from '@/components/admin/uploader';
import { Feedback, Field, SubmitButton } from '@/components/admin/ui';
import type { ActionResult, Edition } from '@/types/database';

function toLocalInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function EditionForm({ edition }: { edition?: Edition }) {
  const isEdit = Boolean(edition);
  const action = isEdit ? updateEdition : createEdition;

  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);

  const [cover, setCover] = useState<UploadedFile>({
    path: edition?.cover_path ?? null,
    url: edition?.cover_url ?? null,
    size: null,
    name: null,
  });

  const [pdf, setPdf] = useState<UploadedFile>({
    path: edition?.pdf_path ?? null,
    url: edition?.pdf_url ?? null,
    size: edition?.pdf_size ?? null,
    name: edition?.pdf_path?.split('/').pop() ?? null,
  });

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      {edition ? <input type="hidden" name="id" value={edition.id} /> : null}
      <input type="hidden" name="cover_path" value={cover.path ?? ''} />
      <input type="hidden" name="cover_url" value={cover.url ?? ''} />
      <input type="hidden" name="pdf_path" value={pdf.path ?? ''} />
      <input type="hidden" name="pdf_url" value={pdf.url ?? ''} />
      <input type="hidden" name="pdf_size" value={pdf.size ?? ''} />

      {/* ── Columna principal ── */}
      <div className="space-y-5">
        {state ? (
          <Feedback tone={state.ok ? 'ok' : 'error'}>
            {state.ok ? (state.message ?? 'Guardado.') : state.error}
          </Feedback>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Número de edición" htmlFor="issue_number" errors={fieldErrors?.issue_number}>
            <input
              id="issue_number"
              name="issue_number"
              type="number"
              min={1}
              required
              defaultValue={edition?.issue_number ?? ''}
              className="campo"
              placeholder="1"
            />
          </Field>

          <Field label="Año" htmlFor="year" errors={fieldErrors?.year}>
            <input
              id="year"
              name="year"
              type="number"
              min={2000}
              max={2100}
              required
              defaultValue={edition?.year ?? new Date().getFullYear()}
              className="campo"
            />
          </Field>
        </div>

        <Field label="Título" htmlFor="title" errors={fieldErrors?.title}>
          <input
            id="title"
            name="title"
            required
            defaultValue={edition?.title ?? ''}
            className="campo"
            placeholder="EL ESCENARIO"
          />
        </Field>

        <Field
          label="Subtítulo"
          htmlFor="subtitle"
          hint="Opcional. Una línea corta bajo el título."
          errors={fieldErrors?.subtitle}
        >
          <input
            id="subtitle"
            name="subtitle"
            defaultValue={edition?.subtitle ?? ''}
            className="campo"
          />
        </Field>

        <Field
          label="Descripción"
          htmlFor="description"
          hint="Aparece en la tarjeta de la edición y en los resultados de búsqueda."
          errors={fieldErrors?.description}
        >
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={edition?.description ?? ''}
            className="campo resize-y"
            placeholder="Presentaciones, historias y todo aquello que ocurrió cuando se apagaron las luces."
          />
        </Field>

        <PdfUploader
          label="Archivo PDF de la revista"
          hint="Es lo que leerán los estudiantes en el lector integrado."
          value={pdf}
          onChange={setPdf}
        />
      </div>

      {/* ── Columna lateral ── */}
      <aside className="space-y-6">
        <div className="marco space-y-5 p-5">
          <ImageUploader
            kind="edition-cover"
            label="Portada"
            hint="Vertical, formato 3:4. También se usa al compartir el enlace."
            value={cover}
            onChange={setCover}
          />
        </div>

        <div className="marco space-y-5 p-5">
          <Field label="Estado" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue={edition?.status ?? 'draft'}
              className="campo"
            >
              <option value="draft">Borrador — solo tú la ves</option>
              <option value="published">Publicada — visible en la web</option>
              <option value="hidden">Oculta — retirada del sitio</option>
            </select>
          </Field>

          <Field
            label="Fecha de publicación"
            htmlFor="published_at"
            hint="Si la dejas vacía se usa la fecha en que publiques."
          >
            <input
              id="published_at"
              name="published_at"
              type="datetime-local"
              defaultValue={toLocalInput(edition?.published_at ?? null)}
              className="campo"
            />
          </Field>

          <label className="flex items-start gap-3 border-2 border-carbon p-3">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={edition?.featured ?? false}
              className="mt-1 h-4 w-4 accent-[#E02118]"
            />
            <span>
              <span className="block font-mono text-[0.68rem] uppercase tracking-[0.14em]">
                Edición destacada
              </span>
              <span className="mt-1 block text-xs text-carbon/60">
                Abre la portada del sitio. Solo puede haber una.
              </span>
            </span>
          </label>
        </div>

        <div className="space-y-3">
          <SubmitButton className="w-full">
            {isEdit ? 'Guardar cambios' : 'Crear edición'}
          </SubmitButton>

          {edition ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/ediciones/${edition.id}`}
                target="_blank"
                className="boton-fantasma flex-1 px-3 py-2"
              >
                Vista previa
              </Link>
              {edition.pdf_url ? (
                <Link
                  href={`/leer/${edition.id}`}
                  target="_blank"
                  className="boton-fantasma flex-1 px-3 py-2"
                >
                  Probar lector
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-carbon/55">
              Se guardará como borrador o publicada según el estado que elijas. Puedes subir el PDF
              ahora o más tarde.
            </p>
          )}
        </div>

        {edition ? (
          <div className="border-t-2 border-carbon pt-5">
            <ConfirmAction
              action={() => deleteEdition(edition.id)}
              label="Eliminar edición"
              question="¿Seguro que quieres eliminar esta edición? Se borrarán también su portada y su PDF."
            />
          </div>
        ) : null}
      </aside>
    </form>
  );
}
