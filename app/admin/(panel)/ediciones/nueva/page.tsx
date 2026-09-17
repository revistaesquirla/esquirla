import Link from 'next/link';
import { EditionForm } from '@/components/admin/edition-form';
import { PageHeading } from '@/components/admin/ui';

export default function NewEditionPage() {
  return (
    <>
      <PageHeading
        title="Nueva edición"
        description="Guarda como borrador cuando quieras. Nada es visible hasta que la publiques."
        actions={
          <Link href="/admin/ediciones" className="boton-fantasma px-4 py-2">
            Volver
          </Link>
        }
      />
      <EditionForm />
    </>
  );
}
