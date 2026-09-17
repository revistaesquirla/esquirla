// Tipos de la base de datos. Si cambias el SQL, actualiza también esto
// (o genera el archivo con: npx supabase gen types typescript --project-id XXX).

export type ContentStatus = 'draft' | 'published' | 'hidden';
export type FragmentKind = 'quote' | 'photo' | 'excerpt';
export type UserRole = 'admin' | 'reader';

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
};

export type Edition = {
  id: string;
  issue_number: number;
  year: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_path: string | null;
  cover_url: string | null;
  pdf_path: string | null;
  pdf_url: string | null;
  pdf_size: number | null;
  page_count: number | null;
  status: ContentStatus;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: unknown | null;
  content_html: string | null;
  cover_path: string | null;
  cover_url: string | null;
  author: string | null;
  category_id: string | null;
  edition_id: string | null;
  status: ContentStatus;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostWithCategory = Post & {
  category: Pick<Category, 'id' | 'name' | 'slug'> | null;
};

export type Fragment = {
  id: string;
  kind: FragmentKind;
  body: string | null;
  attribution: string | null;
  image_path: string | null;
  image_url: string | null;
  post_id: string | null;
  edition_id: string | null;
  status: ContentStatus;
  position: number;
  created_at: string;
  updated_at: string;
};

export type FragmentWithPost = Fragment & {
  post: Pick<Post, 'id' | 'slug' | 'title'> | null;
};

export type Settings = {
  id: boolean;
  magazine_name: string;
  tagline: string | null;
  about_text: string | null;
  participa_text: string | null;
  contact_email: string | null;
  instagram: string | null;
  updated_at: string;
};

/** Respuesta estándar de todas las server actions. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
