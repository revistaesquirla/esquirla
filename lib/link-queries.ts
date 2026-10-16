import { createClient } from '@/lib/supabase/server';
import type { LinkRow } from '@/types/links';

export async function getAllLinks(): Promise<LinkRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as LinkRow[];
}

export async function getLinkById(id: string): Promise<LinkRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('links').select('*').eq('id', id).maybeSingle();
  return (data as LinkRow | null) ?? null;
}

export async function getLinkBySlug(slug: string): Promise<LinkRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('links').select('*').eq('slug', slug).maybeSingle();
  return (data as LinkRow | null) ?? null;
}