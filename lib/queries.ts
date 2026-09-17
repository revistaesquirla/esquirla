import { createClient } from '@/lib/supabase/server';
import type {
  Category,
  Edition,
  FragmentWithPost,
  PostWithCategory,
  Settings,
} from '@/types/database';

const POST_SELECT = '*, category:categories(id, name, slug)';

// ── LECTURA PÚBLICA ───────────────────────────────────────────
// RLS ya filtra por estado, pero filtramos también aquí para que
// las consultas sean explícitas y fáciles de leer.

export async function getPublishedEditions(): Promise<Edition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('editions')
    .select('*')
    .eq('status', 'published')
    .order('issue_number', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedEdition(): Promise<Edition | null> {
  const supabase = await createClient();

  const { data: featured } = await supabase
    .from('editions')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .maybeSingle<Edition>();

  if (featured) return featured;

  // Si nadie marcó una edición como destacada, mostramos la más reciente.
  const { data: latest } = await supabase
    .from('editions')
    .select('*')
    .eq('status', 'published')
    .order('issue_number', { ascending: false })
    .limit(1)
    .maybeSingle<Edition>();

  return latest ?? null;
}

export async function getEditionById(id: string): Promise<Edition | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('editions').select('*').eq('id', id).maybeSingle<Edition>();
  return data ?? null;
}

export async function getPublishedPosts(options?: {
  limit?: number;
  categorySlug?: string;
}): Promise<PostWithCategory[]> {
  const supabase = await createClient();
  let query = supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false });

  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;

  const posts = (data ?? []) as unknown as PostWithCategory[];
  if (!options?.categorySlug) return posts;
  return posts.filter((post) => post.category?.slug === options.categorySlug);
}

export async function getPostBySlug(slug: string): Promise<PostWithCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('posts').select(POST_SELECT).eq('slug', slug).maybeSingle();
  return (data as unknown as PostWithCategory) ?? null;
}

export async function getPublishedFragments(limit = 6): Promise<FragmentWithPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('fragments')
    .select('*, post:posts(id, slug, title)')
    .eq('status', 'published')
    .order('position', { ascending: true })
    .limit(limit);
  return (data as unknown as FragmentWithPost[]) ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').order('name');
  return data ?? [];
}

export async function getSettings(): Promise<Settings | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('settings').select('*').maybeSingle<Settings>();
  return data ?? null;
}

// ── LECTURA DEL PANEL ─────────────────────────────────────────
// Devuelven todo (borradores incluidos). RLS solo lo permite a admins.

export async function getAllEditions(): Promise<Edition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('editions')
    .select('*')
    .order('issue_number', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAllPosts(): Promise<PostWithCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PostWithCategory[];
}

export async function getPostById(id: string): Promise<PostWithCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('posts').select(POST_SELECT).eq('id', id).maybeSingle();
  return (data as unknown as PostWithCategory) ?? null;
}

export async function getAllFragments(): Promise<FragmentWithPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('fragments')
    .select('*, post:posts(id, slug, title)')
    .order('position', { ascending: true });
  return (data as unknown as FragmentWithPost[]) ?? [];
}

export type DashboardStats = {
  editionsTotal: number;
  editionsPublished: number;
  editionsDraft: number;
  postsTotal: number;
  postsPublished: number;
  postsDraft: number;
  latestEdition: Edition | null;
  recentPosts: PostWithCategory[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [editions, posts] = await Promise.all([getAllEditions(), getAllPosts()]);

  return {
    editionsTotal: editions.length,
    editionsPublished: editions.filter((e) => e.status === 'published').length,
    editionsDraft: editions.filter((e) => e.status === 'draft').length,
    postsTotal: posts.length,
    postsPublished: posts.filter((p) => p.status === 'published').length,
    postsDraft: posts.filter((p) => p.status === 'draft').length,
    latestEdition: editions[0] ?? null,
    recentPosts: posts.slice(0, 5),
  };
}
