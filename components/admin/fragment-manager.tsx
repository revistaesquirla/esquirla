'use client';

import { useActionState, useState } from 'react';
import { deleteFragment, saveFragment } from '@/actions/fragments';
import { ConfirmAction } from '@/components/admin/confirm-action';
import { ImageUploader, type UploadedFile } from '@/components/admin/uploader';
import { Feedback, Field, StatusBadge, SubmitButton } from '@/components/admin/ui';
import type { ActionResult, FragmentWithPost, PostWithCategory } from '@/types/database';

export function FragmentManager({
  fragments,
  posts,
}: {
  fragments: FragmentWithPost[];
  posts: PostWithCategory[];
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveFragment, null);
  const [kind, setKind] = useState<'quote' | 'photo' | 'excerpt'>('quote');
  const [image, setImage] = useState<UploadedFile>({ path: null, url: null, size: null, name: null });

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form action={formAction} className="marco h-fit space-y-5 p-5">
        <h2 className="titular text-2xl">Nuevo fragmento</h2>

        <input type="hidden" name="image_path" value={image.path ?? ''} />
        <input type="hidden" name="image_url" value={image.url ?? ''} />

        {state ? (
          <Feedback tone={state.ok ? 'ok' : 'error'}>
            {state.ok ? (state.message ?? 'Guardado.') : state.error}
          </Feedback>
        ) : null}

        <Field label="Tipo" htmlFor="kind">
          <select
            id="kind"
            name="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as typeof kind)}
            className="campo"
          >
            <option value="quote">Frase</option>
            <option value="excerpt">Extracto de un post</option>
            <option value="photo">Fotografía</option>
          </select>
        </Field>

        {kind === 'photo' ? (
          <ImageUploader
            kind="gallery"
            label="Fotografía"
            aspect="aspect-square"
            value={image}
            onChange={setImage}
          />
        ) : null}

        <Field
          label={kind === 'photo' ? 'Pie de foto' : 'Texto'}
          htmlFor="body"
          hint="Máximo 400 caracteres. Que se lea de un vistazo."
        >
          <textarea id="body" name="body" rows={3} className="campo resize-y" maxLength={400} />
        </Field>

        <Field label="De dónde sale" htmlFor="post_id" hint="Opcional: enlaza el fragmento a un post.">
          <select id="post_id" name="post_id" className="campo">
            <option value="">Sin enlace</option>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Atribución" htmlFor="attribution" hint="Quién lo dijo o de dónde viene.">
          <input id="attribution" name="attribution" className="campo" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Orden" htmlFor="position">
            <input id="position" name="position" type="number" min={0} defaultValue={0} className="campo" />
          </Field>

          <Field label="Estado" htmlFor="fragment-status">
            <select id="fragment-status" name="status" defaultValue="published" className="campo">
              <option value="published">Publicado</option>
              <option value="draft">Borrador</option>
              <option value="hidden">Oculto</option>
            </select>
          </Field>
        </div>

        <SubmitButton className="w-full">Agregar fragmento</SubmitButton>
      </form>

      <section>
        <h2 className="titular text-2xl">En la portada</h2>

        {fragments.length === 0 ? (
          <div className="mt-4 border-2 border-dashed border-carbon/40 p-8 text-center text-sm text-carbon/70">
            Todavía no hay fragmentos. Los que agregues aparecerán en la sección FRAGMENTOS de la
            página principal.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {fragments.map((fragment) => (
              <li key={fragment.id} className="marco p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="dato text-carbon/45">
                    #{fragment.position} · {labelFor(fragment.kind)}
                  </span>
                  <StatusBadge status={fragment.status} kind="post" />
                </div>

                {fragment.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fragment.image_url}
                    alt=""
                    className="mt-3 aspect-square w-24 border-2 border-carbon object-cover"
                  />
                ) : null}

                {fragment.body ? <p className="mt-3 leading-snug">{fragment.body}</p> : null}

                <p className="dato mt-2 text-carbon/45">
                  {fragment.post?.title ?? fragment.attribution ?? 'Sin atribución'}
                </p>

                <div className="mt-4">
                  <ConfirmAction
                    action={() => deleteFragment(fragment.id)}
                    label="Eliminar"
                    question="¿Eliminar este fragmento de la portada?"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function labelFor(kind: string) {
  if (kind === 'photo') return 'Fotografía';
  if (kind === 'excerpt') return 'Extracto';
  return 'Frase';
}
