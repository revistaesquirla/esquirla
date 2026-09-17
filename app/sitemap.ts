import type { MetadataRoute } from 'next';
import { getPublishedEditions, getPublishedPosts } from '@/lib/queries';
import { siteUrl } from '@/lib/utils';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/ediciones',
    '/posts',
    '/sobre',
    '/participa',
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));

  try {
    const [editions, posts] = await Promise.all([getPublishedEditions(), getPublishedPosts()]);

    return [
      ...staticRoutes,
      ...editions.map((edition) => ({
        url: `${base}/ediciones/${edition.id}`,
        lastModified: new Date(edition.updated_at),
      })),
      ...posts.map((post) => ({
        url: `${base}/posts/${post.slug}`,
        lastModified: new Date(post.updated_at),
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
