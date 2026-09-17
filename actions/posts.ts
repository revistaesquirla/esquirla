'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import { postSchema, toFieldErrors } from '@/lib/validators';
import { MEDIA_BUCKET } from '@/lib/constants';
import { htmlToPlainText, slugify } from '@/lib/utils';
import type { ActionResult, ContentStatus, Post } from '@/types/database';

function readForm(formData: FormData) {
  const title = String(formData.get('title') ?? '');
  const rawSlug = String(formData.get('slug') ?? '').trim();

  return {
    title,
    slug: rawSlug ? slugify(rawSlug) : slugify(title),
    subtitle: formData.get('subtitle'),
    excerpt: formData.get('excerpt'),
    content_html: formData.get('content_html'),
    content_json: formData.get('content_json'),
    cover_path: formData.get('cover_path'),
    cover_url: formData.get('cover_url'),
    author: formData.get('author'),
    category_id: formData.get('category_id') || null,
    status: formData.get('status'),
    featured: formData.get('featured') === 'on' || formData.get('featured') === 'true',
    published_at: formData.get('published_at'),
  };
}

function revalidatePosts(slug?: string | null) {
  revalidatePath('/');
  revalidatePath('/posts');
  revalidatePath('/admin');
  revalidatePath('/admin/posts');
  if (slug) revalidatePath(`/posts/${slug}`);
}

function buildRow(values: ReturnType<typeof postSchema.parse>, currentPublishedAt: string | null) {
  const { content_json, ...rest } = values;

  let content: unknown = null;
  if (content_json) {
    try {
      content = JSON.parse(content_json);
    } catch {
      content = null;
    }
  }

  return {
    ...rest,
    content,
    excerpt: values.excerpt ?? (htmlToPlainText(values.content_html, 200) || null),
    published_at:
      values.published_at
        ? new Date(values.published_at).toISOString()
        : currentPublishedAt ?? (values.status === 'published' ? new Date().toISOString() : null),
  };
}

export async function createPost(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const parsed = postSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revisa los campos marcados.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .insert(buildRow(parsed.data, null))
    .select('id, slug')
    .single<{ id: string; slug: string }>();

  if (error) {
    if (error.code === '23505') {
      return {
        ok: false,
        error: 'Ya existe un post con esa URL.',
        fieldErrors: { slug: ['Cambia la URL, ya está ocupada.'] },
      };
    }
    return { ok: false, error: 'No se pudo guardar el post. Inténtalo de nuevo.' };
  }

  revalidatePosts(data.slug);
  redirect(`/admin/posts/${data.id}?creado=1`);
}

export async function updatePost(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const id = String(formData.get('id') ?? '');
  if (!id) return { ok: false, error: 'Falta el identificador del post.' };

  const parsed = postSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Revisa los campos marcados.',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from('posts')
    .select('published_at, cover_path, slug')
    .eq('id', id)
    .maybeSingle<Pick<Post, 'published_at' | 'cover_path' | 'slug'>>();

  const { error } = await supabase
    .from('posts')
    .update(buildRow(parsed.data, current?.published_at ?? null))
    .eq('id', id);

  if (error) {
    if (error.code === '23505') {
      return {
        ok: false,
        error: 'Ya existe un post con esa URL.',
        fieldErrors: { slug: ['Cambia la URL, ya está ocupada.'] },
      };
    }
    return { ok: false, error: 'No se pudieron guardar los cambios.' };
  }

  if (current?.cover_path && current.cover_path !== parsed.data.cover_path) {
    await supabase.storage.from(MEDIA_BUCKET).remove([current.cover_path]);
  }

  revalidatePosts(current?.slug);
  revalidatePosts(parsed.data.slug);
  return { ok: true, message: 'Cambios guardados.' };
}

export async function setPostStatus(id: string, status: ContentStatus): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para publicar.' };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from('posts')
    .select('published_at, slug')
    .eq('id', id)
    .maybeSingle<Pick<Post, 'published_at' | 'slug'>>();

  const { error } = await supabase
    .from('posts')
    .update({
      status,
      published_at:
        status === 'published'
          ? (current?.published_at ?? new Date().toISOString())
          : (current?.published_at ?? null),
    })
    .eq('id', id);

  if (error) return { ok: false, error: 'No se pudo cambiar el estado del post.' };

  revalidatePosts(current?.slug);
  return { ok: true, message: status === 'published' ? 'Post publicado.' : 'Post despublicado.' };
}

export async function deletePost(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para eliminar.' };
  }

  const supabase = await createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('cover_path, slug')
    .eq('id', id)
    .maybeSingle<Pick<Post, 'cover_path' | 'slug'>>();

  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { ok: false, error: 'No se pudo eliminar el post.' };

  if (post?.cover_path) await supabase.storage.from(MEDIA_BUCKET).remove([post.cover_path]);

  revalidatePosts(post?.slug);
  redirect('/admin/posts?eliminado=1');
}
