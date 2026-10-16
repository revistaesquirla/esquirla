'use client';

import { startTransition, useActionState, useEffect, useRef, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  deleteFragment,
  reorderFragment,
  saveFragment,
  setFragmentStatus,
  type FragmentMove,
} from '@/actions/fragments';
import { ConfirmAction } from '@/components/admin/confirm-action';
import { ImageUploader, type UploadedFile } from '@/components/admin/uploader';
import { Feedback, Field, StatusBadge } from '@/components/admin/ui';
import { HOME_FRAGMENT_LIMIT } from '@/lib/fragments-config';
import type { ActionResult, FragmentWithPost, PostWithCategory } from '@/types/database';

const EMPTY_FILE: UploadedFile = { path: null, url: null, size: null, name: null };

export function FragmentManager({
  fragments,
  posts,
}: {
  fragments: FragmentWithPost[];
  posts: PostWithCategory[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, saving] = useActionState<ActionResult | null, FormData>(
    saveFragment,
    null,
  );
  const [kind, setKind] = useState<'quote' | 'photo' | 'excerpt' | 'video'>('quote')
  const [image, setImage] = useState<UploadedFile>(EMPTY_FILE);
  const [working, startWork] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setImage(EMPTY_FILE);
    }
  }, [state]);

  // Enviamos a mano para que React NO limpie el formulario cuando hay un error.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  function run(task: () => Promise<ActionResult>) {
    startWork(async () => {
      const result = await task();
      setActionError(result.ok ? null : result.error);
      router.refresh();
    });
  }

  const onHome = new Set(
    fragments
      .filter((fragment) => fragment.status === 'published')
      .slice(0, HOME_FRAGMENT_LIMIT)
      .map((fragment) => fragment.id),
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form ref={formRef} onSubmit={handleSubmit} className="marco h-fit space-y-5 p-5">
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
	    <option value="video">Video (enlace)</option>
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
        {kind === 'video' ? (
          <Field label="Enlace del video" htmlFor="video_url" hint="YouTube, Vimeo o Instagram (reel o post).">
            <input
              id="video_url"
              name="video_url"
              type="url"
              className="campo"
              placeholder="https://www.youtube.com/watch?v=…"
            />
          </Field>
        ) : null}
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

        <Field label="Estado" htmlFor="fragment-status">
          <select id="fragment-status" name="status" defaultValue="published" className="campo">
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
            <option value="hidden">Oculto</option>
          </select>
        </Field>

        <button type="submit" disabled={saving} aria-busy={saving} className="boton w-full">
          {saving ? 'Guardando…' : 'Agregar fragmento'}
        </button>
      </form>

      <section>
        <h2 className="titular text-2xl">En la portada</h2>
        <p className="mt-1 text-sm text-carbon/60">
          Usa las flechas para cambiar el orden. En la portada caben {HOME_FRAGMENT_LIMIT}: los
          primeros de la lista que estén publicados.
        </p>

        {actionError ? (
          <p role="alert" className="mt-3 text-xs font-bold text-rojo-oscuro">
            {actionError}
          </p>
        ) : null}

        {fragments.length === 0 ? (
          <div className="mt-4 border-2 border-dashed border-carbon/40 p-8 text-center text-sm text-carbon/70">
            Todavía no hay fragmentos. Los que agregues aparecerán en la sección FRAGMENTOS de la
            página principal.
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {fragments.map((fragment, index) => {
              const move = (direction: FragmentMove) =>
                run(() => reorderFragment(fragment.id, direction));
              const isPublished = fragment.status === 'published';

              return (
                <li key={fragment.id} className="marco flex gap-3 p-4">
                  <div className="flex flex-col gap-1">
                    <MoveButton label="Al inicio" symbol="⇈" disabled={working || index === 0} onClick={() => move('top')} />
                    <MoveButton label="Subir" symbol="▲" disabled={working || index === 0} onClick={() => move('up')} />
                    <MoveButton label="Bajar" symbol="▼" disabled={working || index === fragments.length - 1} onClick={() => move('down')} />
                    <MoveButton label="Al final" symbol="⇊" disabled={working || index === fragments.length - 1} onClick={() => move('bottom')} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="dato text-carbon/45">
                        #{index + 1} · {labelFor(fragment.kind)}
                      </span>
                      <StatusBadge status={fragment.status} kind="post" />
                    </div>

                    {isPublished ? (
                      <p className={`dato mt-1 ${onHome.has(fragment.id) ? 'text-rojo' : 'text-carbon/45'}`}>
                        {onHome.has(fragment.id)
                          ? 'Se ve en la portada'
                          : 'No cabe en la portada: súbelo para que se vea'}
                      </p>
                    ) : null}

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

                    <div className="mt-4 space-y-3">
                      <button
                        type="button"
                        disabled={working}
                        onClick={() =>
                          run(() => setFragmentStatus(fragment.id, isPublished ? 'hidden' : 'published'))
                        }
                        className="boton-fantasma px-4 py-2"
                      >
                        {isPublished ? 'Ocultar' : 'Publicar'}
                      </button>

                      <ConfirmAction
                        action={() => deleteFragment(fragment.id)}
                        label="Eliminar"
                        question="¿Eliminar este fragmento de la portada?"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function MoveButton({
  label,
  symbol,
  disabled,
  onClick,
}: {
  label: string;
  symbol: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="border-2 border-carbon px-2 py-1 font-mono text-xs transition-colors hover:bg-carbon hover:text-paper disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-carbon"
    >
      {symbol}
    </button>
  );
}

function labelFor(kind: string) {
  if (kind === 'photo') return 'Fotografía';
     if (kind === 'video') return 'Video';
  if (kind === 'excerpt') return 'Extracto';
  return 'Frase';
}