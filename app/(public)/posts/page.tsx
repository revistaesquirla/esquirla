import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/public/empty-state';
import { PostCard } from '@/components/public/post-card';
import { getCategories, getPublishedPosts } from '@/lib/queries';
import { cn } from '@/lib/utils';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Artículos, crónicas, retratos y opiniones publicados por la revista.',
};

type Props = { searchParams: Promise<{ categoria?: string }> };

export default async function PostsPage({ searchParams }: Props) {
  const { categoria } = await searchParams;

  const [posts, categories] = await Promise.all([
    getPublishedPosts({ categorySlug: categoria }).catch(() => null),
    getCategories().catch(() => []),
  ]);

  if (posts === null) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <EmptyState
          title="No se pudieron cargar los posts"
          description="Revisa tu conexión y vuelve a cargar la página."
        />
      </div>
    );
  }

  const activeCategory = categories.find((category) => category.slug === categoria);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <header className="border-b-2 border-carbon pb-6">
        <h1 className="titular text-[clamp(2.8rem,10vw,6rem)]">Posts</h1>
        {activeCategory?.description ? (
          <p className="mt-3 max-w-lg text-carbon/70">{activeCategory.description}</p>
        ) : null}
      </header>

      {categories.length > 0 ? (
        <nav aria-label="Categorías" className="mt-6 flex flex-wrap gap-2">
          <CategoryChip href="/posts" label="Todo" active={!categoria} />
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              href={`/posts?categoria=${category.slug}`}
              label={category.name}
              active={categoria === category.slug}
            />
          ))}
        </nav>
      ) : null}

      <div className="mt-10 grid gap-4">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <EmptyState
            title={categoria ? 'Nada en esta categoría todavía' : 'Todavía no hay posts'}
            description={
              categoria
                ? 'Prueba con otra categoría o revisa el archivo completo.'
                : 'Los artículos que se publiquen desde el panel aparecerán aquí.'
            }
            actionHref={categoria ? '/posts' : '/ediciones'}
            actionLabel={categoria ? 'Ver todos los posts' : 'Ver ediciones'}
          />
        )}
      </div>
    </div>
  );
}

function CategoryChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'border-2 border-carbon px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors',
        active ? 'bg-carbon text-paper' : 'hover:bg-rojo hover:text-paper',
      )}
    >
      {label}
    </Link>
  );
}
