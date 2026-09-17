'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useActionState, useState } from 'react';
import { createPost, deletePost, updatePost } from '@/actions/posts';
import { ConfirmAction } from '@/components/admin/confirm-action';
import { ImageUploader, type UploadedFile } from '@/components/admin/uploader';
import { Feedback, Field, SubmitButton } from '@/components/admin/ui';
import type { EditorValue } from '@/components/editor/rich-text-editor';
import { slugify } from '@/lib/utils';
import type { ActionResult, Category, PostWithCategory } from '@/types/database';

const RichTextEditor = dynamic(
  () => import('@/components/editor/rich-text-editor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="marco grid min-h-[320px] place-items-center">
        <p className="dato text-carbon/50">Cargando editor…</p>
      </div>
    ),
  },
);

function toLocalInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function PostForm({
  post,
  categories,
}: {
  post?: PostWithCategory;
  categories: Category[];
}) {
  const isEdit = Boolean(post);
  const action = isEdit ? updatePost : createPost;

  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));

  const [content, setContent] = useState<EditorValue>({
    html: post?.content_html ?? '',
    json: post?.content ? JSON.stringify(post.content) : '',
  });

  const [cover, setCover] = useState<UploadedFile>({
    path: post?.cover_path ?? null,
    url: post?.cover_url ?? null,
    size: null,
    name: null,
  });

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <input type="hidden" name="content_html" value={content.html} />
      <input type="hidden" name="content_json" value={content.json} />
      <input type="hidden" name="cover_path" value={cover.path ?? ''} />
      <input type="hidden" name="cover_url" value={cover.url ?? ''} />

      <div className="space-y-5">
        {state ? (
          <Feedback tone={state.ok ? 'ok' : 'error'}>
            {state.ok ? (state.message ?? 'Guardado.') : state.error}
          </Feedback>
        ) : null}

        <Field label="Título" htmlFor="title" errors={fieldErrors?.title}>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            className="campo text-xl font-bold"
            placeholder="El día que se fue la luz en el auditorio"
          />
        </Field>

        <Field
          label="URL del post"
          htmlFor="slug"
          hint="Así se verá la dirección: /posts/tu-url"
          errors={fieldErrors?.slug}
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

        <Field label="Subtítulo" htmlFor="subtitle" errors={fieldErrors?.subtitle}>
          <input
            id="subtitle"
            name="subtitle"
            defaultValue={post?.subtitle ?? ''}
            className="campo"
          />
        </Field>

        <div>
          <p className="etiqueta">Contenido</p>
          <RichTextEditor initialHtml={post?.content_html ?? ''} onChange={setContent} />
          <p className="mt-2 text-xs text-carbon/55">
            El texto se guarda al presionar Guardar. No hace falta escribir HTML.
          </p>
        </div>

        <Field
          label="Resumen"
          htmlFor="excerpt"
          hint="Aparece en el listado y al compartir. Si lo dejas vacío se genera del contenido."
          errors={fieldErrors?.excerpt}
        >
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            defaultValue={post?.excerpt ?? ''}
            className="campo resize-y"
          />
        </Field>
      </div>

      <aside className="space-y-6">
        <div className="marco p-5">
          <ImageUploader
            kind="post-cover"
            label="Imagen principal"
            hint="Horizontal, formato 16:9."
            aspect="aspect-[16/9]"
            value={cover}
            onChange={setCover}
          />
        </div>

        <div className="marco space-y-5 p-5">
          <Field label="Autor" htmlFor="author" errors={fieldErrors?.author}>
            <input
              id="author"
              name="author"
              defaultValue={post?.author ?? ''}
              className="campo"
              placeholder="Nombre de quien escribe"
            />
          </Field>

          <Field label="Categoría" htmlFor="category_id">
            <select
              id="category_id"
              name="category_id"
              defaultValue={post?.category_id ?? ''}
              className="campo"
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Estado" htmlFor="status">
            <select id="status" name="status" defaultValue={post?.status ?? 'draft'} className="campo">
              <option value="draft">Borrador — solo tú lo ves</option>
              <option value="published">Publicado — visible en la web</option>
              <option value="hidden">Oculto — retirado del sitio</option>
            </select>
          </Field>

          <Field label="Fecha de publicación" htmlFor="published_at">
            <input
              id="published_at"
              name="published_at"
              type="datetime-local"
              defaultValue={toLocalInput(post?.published_at ?? null)}
              className="campo"
            />
          </Field>

          <label className="flex items-start gap-3 border-2 border-carbon p-3">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={post?.featured ?? false}
              className="mt-1 h-4 w-4 accent-[#E02118]"
            />
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em]">
              Post destacado
            </span>
          </label>
        </div>

        <div className="space-y-3">
          <SubmitButton className="w-full">{isEdit ? 'Guardar cambios' : 'Crear post'}</SubmitButton>

          {post ? (
            <Link href={`/posts/${post.slug}`} target="_blank" className="boton-fantasma w-full px-3 py-2">
              Vista previa
            </Link>
          ) : null}
        </div>

        {post ? (
          <div className="border-t-2 border-carbon pt-5">
            <ConfirmAction
              action={() => deletePost(post.id)}
              label="Eliminar post"
              question="¿Seguro que quieres eliminar este post? Se borrará también su imagen principal."
            />
          </div>
        ) : null}
      </aside>
    </form>
  );
}
