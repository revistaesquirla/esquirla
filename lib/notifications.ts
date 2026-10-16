import { createClient } from '@/lib/supabase/server';
import { formatEventWhen, isPastEvent } from '@/lib/events';
import { formatDate, padIssue } from '@/lib/utils';
import type { EventRow } from '@/types/events';
import type { NotificationItem } from '@/types/notifications';

const EVENT_WINDOW_DAYS = 30;

/**
 * Arma las novedades solas, con lo que ya está publicado:
 * próximas fechas primero, luego lo más reciente entre ediciones y posts.
 * Si algo falla, devuelve una lista vacía y el sitio sigue funcionando.
 */
export async function getNotifications(): Promise<NotificationItem[]> {
  try {
    const supabase = await createClient();
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const [editions, posts, events] = await Promise.all([
      supabase
        .from('editions')
        .select('id, issue_number, title, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(3),
      supabase
        .from('posts')
        .select('slug, title, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(4),
      supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('starts_at', since)
        .order('starts_at', { ascending: true })
        .limit(10),
    ]);

    const horizon = now.getTime() + EVENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;

    const eventItems: NotificationItem[] = ((events.data ?? []) as EventRow[])
      .filter((event) => !isPastEvent(event, now) && new Date(event.starts_at).getTime() <= horizon)
      .slice(0, 3)
      .map((event) => ({
        id: `event:${event.id}`,
        type: 'event',
        title: event.title,
        detail: formatEventWhen(event),
        href: '/calendario',
      }));

    const recent = [
      ...(editions.data ?? []).map((edition) => ({
        time: edition.published_at ? new Date(edition.published_at).getTime() : 0,
        item: {
          id: `edition:${edition.id}`,
          type: 'edition' as const,
          title: `Edición ${padIssue(edition.issue_number)} · ${edition.title}`,
          detail: formatDate(edition.published_at),
          href: `/ediciones/${edition.id}`,
        },
      })),
      ...(posts.data ?? []).map((post) => ({
        time: post.published_at ? new Date(post.published_at).getTime() : 0,
        item: {
          id: `post:${post.slug}`,
          type: 'post' as const,
          title: post.title as string,
          detail: formatDate(post.published_at),
          href: `/posts/${post.slug}`,
        },
      })),
    ]
      .sort((a, b) => b.time - a.time)
      .slice(0, 5)
      .map((entry) => entry.item);

    return [...eventItems, ...recent];
  } catch {
    return [];
  }
}