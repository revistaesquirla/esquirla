import Link from 'next/link';
import { EventForm } from '@/components/admin/event-form';
import { PageHeading } from '@/components/admin/ui';

export default function NewEventPage() {
  return (
    <>
      <PageHeading
        title="Nueva fecha"
        description="Nace como borrador. Publícala cuando esté lista."
        actions={
          <Link href="/admin/fechas" className="boton-fantasma px-4 py-2">
            Volver
          </Link>
        }
      />
      <EventForm />
    </>
  );
}