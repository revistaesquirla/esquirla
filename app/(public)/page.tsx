import Link from 'next/link';
import { CoverImage } from '@/components/public/cover-image';
import { EditionCard } from '@/components/public/edition-card';
import { EmptyState } from '@/components/public/empty-state';
import { Marquee } from '@/components/public/marquee';
import { PostCard } from '@/components/public/post-card';
import {
  getFeaturedEdition,
  getPublishedEditions,
  getPublishedFragments,
  getPublishedPosts,
} from '@/lib/queries';
import { padIssue } from '@/lib/utils';

export const revalidate = 60;

export default async function HomePage() {
  const [featured, editions, posts, fragments] = await Promise.all([
    getFeaturedEdition().catch(() => null),
    getPublishedEditions().catch(() => []),
    getPublishedPosts({ limit: 5 }).catch(() => []),
    getPublishedFragments(6).catch(() => []),
  ]);

  const otherEditions = editions.filter((edition) => edition.id !== featured?.id).slice(0, 3);

  // La cinta se arma con contenido real: categorías y títulos que existen.
  const marqueeItems = [
    ...posts.map((post) => post.category?.name ?? post.title),
    ...editions.slice(0, 4).map((edition) => `Edición ${padIssue(edition.issue_number)}`),
  ].filter(Boolean);

  return (
    <>
      {/* ── HERO: la edición destacada sale de la base de datos ── */}
      <section className="border-b-2 border-carbon">
        {featured ? (
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div className="animate-rise">
              <p className="dato text-rojo">
                Edición {padIssue(featured.issue_number)} · {featured.year}
              </p>

              <h1 className="titular mt-4 text-[clamp(3rem,11vw,7.5rem)]">{featured.title}</h1>

              {featured.subtitle ? (
                <p className="mt-3 font-mono text-sm uppercase tracking-[0.14em] text-carbon/60">
                  {featured.subtitle}
                </p>
              ) : null}

              {featured.description ? (
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-carbon/80">
                  {featured.description}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                {featured.pdf_url ? (
                  <Link href={`/leer/${featured.id}`} className="boton">
                    Leer edición
                  </Link>
                ) : null}
                <Link href={`/ediciones/${featured.id}`} className="boton-fantasma">
                  Ver la ficha
                </Link>
              </div>
            </div>

            <Link
              href={featured.pdf_url ? `/leer/${featured.id}` : `/ediciones/${featured.id}`}
              className="block max-w-sm justify-self-center transition-transform duration-200 hover:-rotate-1 lg:justify-self-end"
            >
              <CoverImage
                src={featured.cover_url}
                alt={`Portada de la edición ${padIssue(featured.issue_number)}: ${featured.title}`}
                priority
                sizes="(max-width: 1024px) 80vw, 420px"
                className="shadow-block-rojo"
                fallbackLabel={`Edición ${padIssue(featured.issue_number)}`}
              />
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h1 className="titular text-[clamp(3rem,11vw,7.5rem)]">Esquirla</h1>
            <p className="mt-6 max-w-lg text-lg text-carbon/80">
              Todavía no hay ninguna edición publicada. Entra al panel, crea la primera y aparecerá
              aquí automáticamente.
            </p>
            <Link href="/admin" className="boton mt-8">
              Ir al panel
            </Link>
          </div>
        )}
      </section>

      {marqueeItems.length > 0 ? <Marquee items={marqueeItems} /> : null}

      {/* ── FRAGMENTOS ── */}
      {fragments.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="titular text-4xl sm:text-5xl">Fragmentos</h2>
            <span className="dato text-carbon/50">{fragments.length} piezas</span>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fragments.map((fragment, index) => (
              <li
                key={fragment.id}
                className={
                  index % 5 === 0
                    ? 'border-2 border-carbon bg-carbon p-6 text-paper'
                    : 'border-2 border-carbon p-6'
                }
              >
                {fragment.kind === 'photo' && fragment.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fragment.image_url}
                    alt={fragment.body ?? 'Fotografía publicada en Esquirla'}
                    className="mb-4 aspect-square w-full border-2 border-current object-cover"
                    loading="lazy"
                  />
                ) : null}

                {fragment.body ? (
                  <p className="text-lg leading-snug">{fragment.body}</p>
                ) : null}

                <p className="dato mt-4 opacity-60">
                  {fragment.post ? (
                    <Link href={`/posts/${fragment.post.slug}`} className="hover:text-rojo">
                      {fragment.post.title}
                    </Link>
                  ) : (
                    fragment.attribution ?? 'Esquirla'
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── POSTS RECIENTES ── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="titular text-4xl sm:text-5xl">Lo último</h2>
          <Link href="/posts" className="dato text-rojo hover:underline">
            Todos los posts
          </Link>
        </div>

        <div className="mt-8 grid gap-4">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <EmptyState
              title="Todavía no hay posts"
              description="Los artículos que publiques desde el panel aparecerán aquí."
            />
          )}
        </div>
      </section>

      {/* ── OTRAS EDICIONES ── */}
      {otherEditions.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 pb-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="titular text-4xl sm:text-5xl">Ediciones anteriores</h2>
            <Link href="/ediciones" className="dato text-rojo hover:underline">
              Ver el archivo
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherEditions.map((edition) => (
              <EditionCard key={edition.id} edition={edition} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
