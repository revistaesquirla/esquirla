import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostForm } from '@/components/admin/post-form';
import { PageHeading } from '@/components/admin/ui';
import { getCategories, getPostById } from '@/lib/queries';

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creado?: string }>;
}) {
  const [{ id }, { creado }] = await Promise.all([params, searchParams]);
  const [post, categories] = await Promise.all([
    getPostById(id).catch(() => null),
    getCategories().catch(() => []),
  ]);

  if (!post) notFound();

  return (
    <>
      <PageHeading
        title="Editar post"
        description={post.title}
        actions={
          <Link href="/admin/posts" className="boton-fantasma px-4 py-2">
            Volver
          </Link>
        }
      />

      {creado ? (
        <p className="mb-6 border-2 border-carbon bg-carbon px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper">
          Post creado.
        </p>
      ) : null}

      <PostForm post={post} categories={categories} />
    </>
  );
}
