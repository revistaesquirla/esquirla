import Link from 'next/link';
import { PostForm } from '@/components/admin/post-form';
import { PageHeading } from '@/components/admin/ui';
import { getCategories } from '@/lib/queries';

export default async function NewPostPage() {
  const categories = await getCategories().catch(() => []);

  return (
    <>
      <PageHeading
        title="Nuevo post"
        description="Escribe con el editor. No hace falta saber HTML."
        actions={
          <Link href="/admin/posts" className="boton-fantasma px-4 py-2">
            Volver
          </Link>
        }
      />
      <PostForm categories={categories} />
    </>
  );
}
