import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EditionForm } from '@/components/admin/edition-form';
import { PageHeading } from '@/components/admin/ui';
import { getEditionById } from '@/lib/queries';
import { padIssue } from '@/lib/utils';

export default async function EditEditionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creada?: string }>;
}) {
  const [{ id }, { creada }] = await Promise.all([params, searchParams]);
  const edition = await getEditionById(id).catch(() => null);

  if (!edition) notFound();

  return (
    <>
      <PageHeading
        title={`Edición ${padIssue(edition.issue_number)}`}
        description={edition.title}
        actions={
          <Link href="/admin/ediciones" className="boton-fantasma px-4 py-2">
            Volver
          </Link>
        }
      />

      {creada ? (
        <p className="mb-6 border-2 border-carbon bg-carbon px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper">
          Edición creada. Ya puedes subir la portada y el PDF.
        </p>
      ) : null}

      <EditionForm edition={edition} />
    </>
  );
}
