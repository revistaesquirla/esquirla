'use client';

import Link from 'next/link';
import { startTransition, useActionState, useState } from 'react';
import type { FormEvent } from 'react';
import { createLink, deleteLink, updateLink } from '@/actions/links';
import { ConfirmAction } from '@/components/admin/confirm-action';
import { CopyButton } from '@/components/admin/copy-button';
import { ImageUploader, type UploadedFile } from '@/components/admin/uploader';
import { Feedback, Field } from '@/components/admin/ui';
import { slugify } from '@/lib/utils';
import type { ActionResult } from '@/types/database';
import type { LinkMode, LinkRow } from '@/types/links';

export function LinkForm({ link, baseUrl }: { link?: LinkRow; baseUrl: string }) {
  const action = link ? updateLink : createLink;
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null);

  const [label, setLabel] = useState(link?.label ?? '');
  const [slug, setSlug] = useState(link?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(link?.slug));
  const [mode, setMode] = useState<LinkMode>(link?.mode ?? 'redirect');
  const [ogTitle, setOgTitle] = useState(link?.og_title ?? '');
  const [ogDescription, setOgDescription] = useState(link?.og_description ?? '');
  const [image, setImage] = useState<UploadedFile>({
    path: link?.og_image_path ?? null,
    url: link?.og_image_url ?? null,
    size: null,
    name: null,
  });

  const errors = state && !state.ok ? state.fieldErrors : undefined;
  const host = baseUrl.replace(/^https?:\/\//, '');
  const publicUrl = `${baseUrl}/l/${slug}`;

  // Envío manual: así React no borra lo escrito si hay un error de validación.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      {link ? <input type="hidden" name="id" value={link.id} /> : null}
      <input type="hidden" name="og_image_path" value={image.path ?? ''} />
      <input type="hidden" name="og_image_url" value={image.url ?? ''} />

      <div className="space-y-6">
        {state ? (
          <Feedback tone={state.ok ? 'ok' : 'error'}>
            {state.ok ? (state.message ?? 'Guardado.') : state.error}
          </Feedback>
        ) : null}

        <div className="marco space-y-5 p-5">
          <h2 className="titular text-xl">1 · El enlace</h2>

          <Field
            label="Nombre interno"
            htmlFor="label"
            hint="Solo lo ves tú, para reconocerlo en la lista."
            errors={errors?.label}
          >
            <input
              id="label"
              name="label"
              required
              value={label}
              onChange={(event) => {
                setLabel(event.target.value);
                if (!slugTouched) setSlug(slugify(event.target.value));
              }}
              className="campo"
              placeholder="Broma del premio"
            />
          </Field>

          <Field
            label="Dirección del enlace"
            htmlFor="slug"
            hint={`Quedará así: ${baseUrl}/l/${slug || 'tu-direccion'}`}
            errors={errors?.slug}
          >
            <input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              onBlur={(event) => setSlug(slugify(event.target.value))}
              className="campo font-mono text-sm"
            />
          </Field>
        </div>

        <div className="marco space-y-5 p-5">
          <h2 className="titular text-xl">2 · Qué pasa al abrirlo</h2>

          <Field label="Modo" htmlFor="mode">
            <select
              id="mode"
              name="mode"
              value={mode}
              onChange={(event) => setMode(event.target.value as LinkMode)}
              className="campo"
            >
              <option value="redirect">Redirigir directo a otra dirección</option>
              <option value="menu">Mostrar una página con mensaje y botones</option>
            </select>
          </Field>

          <div className={mode === 'redirect' ? 'space-y-5' : 'hidden'}>
            <Field
              label="Llevar a"
              htmlFor="target_url"
              hint="Pega la dirección completa."
              errors={errors?.target_url}
            >
              <input
                id="target_url"
                name="target_url"
                type="url"
                defaultValue={link?.target_url ?? ''}
                className="campo"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              />
            </Field>
          </div>

          <div className={mode === 'menu' ? 'space-y-5' : 'hidden'}>
            <Field label="Título de la página" htmlFor="page_title" errors={errors?.page_title}>
              <input
                id="page_title"
                name="page_title"
                defaultValue={link?.page_title ?? ''}
                className="campo"
                placeholder="¡Ganaste! …o eso creías"
              />
            </Field>

            <Field label="Mensaje" htmlFor="page_message" errors={errors?.page_message}>
              <textarea
                id="page_message"
                name="page_message"
                rows={4}
                defaultValue={link?.page_message ?? ''}
                className="campo resize-y"
              />
            </Field>

            <div className="space-y-4">
              <p className="etiqueta">Botones (hasta 4, opcionales)</p>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label={`Botón ${i + 1} · texto`}
                    htmlFor={`button_label_${i + 1}`}
                    errors={errors?.[`button_label_${i + 1}`]}
                  >
                    <input
                      id={`button_label_${i + 1}`}
                      name={`button_label_${i + 1}`}
                      maxLength={60}
                      defaultValue={link?.buttons?.[i]?.label ?? ''}
                      className="campo"
                    />
                  </Field>
                  <Field
                    label={`Botón ${i + 1} · dirección`}
                    htmlFor={`button_url_${i + 1}`}
                    errors={errors?.[`button_url_${i + 1}`]}
                  >
                    <input
                      id={`button_url_${i + 1}`}
                      name={`button_url_${i + 1}`}
                      type="url"
                      defaultValue={link?.buttons?.[i]?.url ?? ''}
                      className="campo"
                      placeholder="https://"
                    />
                  </Field>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="marco space-y-5 p-5">
          <h2 className="titular text-xl">3 · Cómo se ve al compartirlo</h2>
          <p className="text-sm text-carbon/70">
            Lo que aparece en la tarjeta de WhatsApp, Instagram, X, etc. No tiene que ver con lo
            que hay detrás del enlace.
          </p>

          <Field label="Título de la vista previa" htmlFor="og_title" errors={errors?.og_title}>
            <input
              id="og_title"
              name="og_title"
              value={ogTitle}
              onChange={(event) => setOgTitle(event.target.value)}
              className="campo"
              maxLength={100}
            />
          </Field>

          <Field
            label="Descripción de la vista previa"
            htmlFor="og_description"
            errors={errors?.og_description}
          >
            <textarea
              id="og_description"
              name="og_description"
              rows={2}
              value={ogDescription}
              onChange={(event) => setOgDescription(event.target.value)}
              className="campo resize-y"
              maxLength={300}
            />
          </Field>

          <ImageUploader
            kind="gallery"
            label="Imagen de la vista previa"
            hint="Horizontal, 1200×630 y menos de 300 KB: WhatsApp no muestra imágenes más pesadas."
            aspect="aspect-[1.91/1]"
            value={image}
            onChange={setImage}
          />
          {errors?.og_image ? (
            <p className="text-xs font-bold text-rojo-oscuro">{errors.og_image[0]}</p>
          ) : null}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="marco space-y-3 p-5">
          <p className="etiqueta">Así se verá la tarjeta</p>
          <div className="border-2 border-carbon">
            <div className="aspect-[1.91/1] bg-cemento/30">
              {image.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center">
                  <span className="dato text-carbon/50">Sin imagen</span>
                </div>
              )}
            </div>
            <div className="border-t-2 border-carbon p-3">
              <p className="dato text-carbon/50">{host}</p>
              <p className="mt-1 font-bold leading-snug">{ogTitle || 'Título de la vista previa'}</p>
              <p className="mt-1 line-clamp-2 text-sm text-carbon/70">
                {ogDescription || 'Descripción de la vista previa'}
              </p>
            </div>
          </div>
          <p className="text-xs text-carbon/55">Aproximado: cada app lo dibuja a su manera.</p>
        </div>

        <div className="marco p-5">
          <label className="flex items-start gap-3 border-2 border-carbon p-3">
            <input
              type="checkbox"
              name="active"
              defaultChecked={link?.active ?? true}
              className="mt-1 h-4 w-4 accent-[#E02118]"
            />
            <span>
              <span className="block font-mono text-[0.68rem] uppercase tracking-[0.14em]">Activo</span>
              <span className="mt-1 block text-xs text-carbon/60">
                Si lo desmarcas, el enlace deja de funcionar (da error 404).
              </span>
            </span>
          </label>
        </div>

        {link ? (
          <div className="marco space-y-3 p-5">
            <p className="etiqueta">Enlace para compartir</p>
            <p className="break-all font-mono text-xs">{publicUrl}</p>
            <div className="flex flex-wrap gap-2">
              <CopyButton text={publicUrl} />
              <Link
                href={`/l/${link.slug}`}
                target="_blank"
                className="border-2 border-carbon px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] transition-colors hover:bg-carbon hover:text-paper"
              >
                Probar
              </Link>
            </div>
            <p className="dato text-carbon/50">{link.clicks} aperturas</p>
          </div>
        ) : null}

        <button type="submit" disabled={pending} aria-busy={pending} className="boton w-full">
          {pending ? 'Guardando…' : link ? 'Guardar cambios' : 'Crear vínculo'}
        </button>

        {link ? (
          <div className="border-t-2 border-carbon pt-5">
            <ConfirmAction
              action={() => deleteLink(link.id)}
              label="Eliminar vínculo"
              question="¿Seguro que quieres eliminar este vínculo? El enlace que ya compartiste dejará de funcionar."
            />
          </div>
        ) : null}
      </aside>
    </form>
  );
}