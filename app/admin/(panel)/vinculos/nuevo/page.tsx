import Link from 'next/link';
import { LinkForm } from '@/components/admin/link-form';
import { PageHeading } from '@/components/admin/ui';
import { siteUrl } from '@/lib/utils';

export default function NewLinkPage() {
  return (
    <>
      <PageHeading
        title="Nuevo vínculo"
        description="Elige qué pasa al abrirlo y cómo se ve al compartirlo."
        actions={
          <Link href="/admin/vinculos" className="boton-fantasma px-4 py-2">
            Volver
          </Link>
        }
      />
      <LinkForm baseUrl={siteUrl()} />
    </>
  );
}