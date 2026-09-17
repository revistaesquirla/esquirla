import { FragmentManager } from '@/components/admin/fragment-manager';
import { PageHeading } from '@/components/admin/ui';
import { getAllFragments, getAllPosts } from '@/lib/queries';

export default async function AdminFragmentsPage() {
  const [fragments, posts] = await Promise.all([
    getAllFragments().catch(() => []),
    getAllPosts().catch(() => []),
  ]);

  return (
    <>
      <PageHeading
        title="Fragmentos"
        description="Frases, fotos y extractos sueltos que se muestran en la portada del sitio."
      />
      <FragmentManager fragments={fragments} posts={posts} />
    </>
  );
}
