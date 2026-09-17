import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPublishedPosts } from '@/lib/queries';
import { formatDate, htmlToPlainText, readingMinutes } from '@/lib/utils';

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);

  if (!post) return { title: 'Post no encontrado' };

  const description = post.excerpt ?? htmlToPlainText(post.content_html, 160);

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      images: post.cover_url ? [{ url: post.cover_url }] : undefined,
    },
    twitter: {
      card: post.cover_url ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: post.cover_url ? [post.cover_url] : undefined,
    },
  };
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);

  if (!post) notFound();

  const related = (await getPublishedPosts({ limit: 4 }).catch(() => []))
    .filter((item) => item.id !== post.id)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <Link href="/posts" className="dato text-carbon/50 hover:text-rojo">
        ← Todos los posts
      </Link>

      <header className="mt-8 border-b-2 border-carbon pb-8">
        <p className="dato text-rojo">
          {post.category ? (
            <Link href={`/posts?categoria=${post.category.slug}`} className="hover:underline">
              {post.category.name}
            </Link>
          ) : (
            'Esquirla'
          )}
        </p>

        <h1 className="titular mt-4 text-[clamp(2.2rem,8vw,4.5rem)]">{post.title}</h1>

        {post.subtitle ? (
          <p className="mt-4 text-xl leading-snug text-carbon/75">{post.subtitle}</p>
        ) : null}

        <p className="dato mt-6 text-carbon/50">
          {[post.author, formatDate(post.published_at), `${readingMinutes(post.content_html)} min`]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      {post.cover_url ? (
        <figure className="mt-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden border-2 border-carbon">
            <Image
              src={post.cover_url}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        </figure>
      ) : null}

      {post.content_html ? (
        <div
          className="prosa mt-10"
          // El HTML lo genera el editor del panel (solo administradores) a
          // partir de un conjunto cerrado de nodos de TipTap.
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />
      ) : (
        <p className="mt-10 text-carbon/60">Este post todavía no tiene contenido.</p>
      )}

      {related.length > 0 ? (
        <section className="mt-16 border-t-2 border-carbon pt-8">
          <h2 className="titular text-2xl">Sigue leyendo</h2>
          <ul className="mt-5 grid gap-3">
            {related.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/posts/${item.slug}`}
                  className="flex items-baseline justify-between gap-4 border-b border-carbon/20 pb-3 hover:text-rojo"
                >
                  <span className="font-bold">{item.title}</span>
                  <span className="dato shrink-0 text-carbon/45">
                    {item.category?.name ?? ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
