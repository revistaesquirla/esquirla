import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LinkForm } from '@/components/admin/link-form';
import { PageHeading } from '@/components/admin/ui';
import { getLinkById } from '@/lib/links-queries';
import { siteUrl } from '@/lib/utils';

export default async function EditLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creado?: string }>;
}) {
  const [{ id }, { creado }] = await Promise.all([params, searchParams]);
  const link = await getLinkById(id).catch(() => null);

  if (!link) notFound();

  return (
    <>
      <PageHeading
        title="Editar vínculo"
        description={link.label}
        actions={
          <Link href="/admin/vinculos" className="boton-fantasma px-4 py-2">
            Volver
          </Link>
        }
      />

      {creado ? (
        <p className="mb-6 border-2 border-carbon bg-carbon px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper">
          Vínculo creado. Cópialo en el panel derecho y compártelo.
        </p>
      ) : null}

      <LinkForm link={link} baseUrl={siteUrl()} />
    </>
  );
}