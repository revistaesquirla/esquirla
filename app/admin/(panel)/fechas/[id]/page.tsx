import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EventForm } from '@/components/admin/event-form';
import { PageHeading } from '@/components/admin/ui';
import { getEventById } from '@/lib/events-queries';

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ creada?: string }>;
}) {
  const [{ id }, { creada }] = await Promise.all([params, searchParams]);
  const event = await getEventById(id).catch(() => null);

  if (!event) notFound();

  return (
    <>
      <PageHeading
        title="Editar fecha"
        description={event.title}
        actions={
          <Link href="/admin/fechas" className="boton-fantasma px-4 py-2">
            Volver
          </Link>
        }
      />

      {creada ? (
        <p className="mb-6 border-2 border-carbon bg-carbon px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper">
          Fecha creada. Cuando esté lista, cámbiala a Publicada.
        </p>
      ) : null}

      <EventForm event={event} />
    </>
  );
}