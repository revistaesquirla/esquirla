import Link from 'next/link';
import { PostRowActions } from '@/components/admin/post-row-actions';
import { PageHeading, StatusBadge } from '@/components/admin/ui';
import { getAllPosts } from '@/lib/queries';
import { formatShortDate } from '@/lib/utils';

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ eliminado?: string }>;
}) {
  const { eliminado } = await searchParams;
  const posts = await getAllPosts().catch(() => null);

  return (
    <>
      <PageHeading
        title="Posts"
        description="Artículos sueltos entre edición y edición."
        actions={
          <Link href="/admin/posts/nuevo" className="boton px-4 py-2">
            Nuevo post
          </Link>
        }
      />

      {eliminado ? (
        <p className="mb-6 border-2 border-carbon bg-carbon px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper">
          Post eliminado.
        </p>
      ) : null}

      {posts === null ? (
        <p className="border-2 border-rojo-oscuro p-5 text-sm text-rojo-oscuro">
          No se pudieron cargar los posts. Vuelve a cargar la página.
        </p>
      ) : posts.length === 0 ? (
        <div className="border-2 border-dashed border-carbon/40 p-10 text-center">
          <p className="titular text-2xl">Todavía no hay posts</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-carbon/70">
            Escribe el primero: título, imagen, categoría y contenido.
          </p>
          <Link href="/admin/posts/nuevo" className="boton mt-6 px-4 py-2">
            Escribir post
          </Link>
        </div>
      ) : (
        <ul className="border-2 border-carbon">
          {posts.map((post) => (
            <li
              key={post.id}
              className="grid gap-3 border-b border-carbon/20 p-4 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div className="min-w-0">
                <p className="dato text-rojo">{post.category?.name ?? 'Sin categoría'}</p>
                <h2 className="titular mt-1 text-xl">
                  <Link href={`/admin/posts/${post.id}`} className="hover:text-rojo">
                    {post.title}
                  </Link>
                </h2>
                <p className="dato mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-carbon/45">
                  <StatusBadge status={post.status} kind="post" />
                  {post.author ? <span>{post.author}</span> : null}
                  <span>Editado {formatShortDate(post.updated_at)}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <PostRowActions id={post.id} status={post.status} />
                <Link href={`/admin/posts/${post.id}`} className="boton px-4 py-2">
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
