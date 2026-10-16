import { createClient } from '@/lib/supabase/server';
import type { EventRow } from '@/types/events';

export async function getPublishedEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export async function getAllEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export async function getEventById(id: string): Promise<EventRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
  return (data as EventRow | null) ?? null;
}