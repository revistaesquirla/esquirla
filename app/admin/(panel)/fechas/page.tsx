import Link from 'next/link';
import { EventRowActions } from '@/components/admin/event-row-actions';
import { PageHeading, StatusBadge } from '@/components/admin/ui';
import { formatEventWhen } from '@/lib/events';
import { getAllEvents } from '@/lib/events-queries';

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ eliminada?: string }>;
}) {
  const { eliminada } = await searchParams;
  const events = await getAllEvents().catch(() => null);

  return (
    <>
      <PageHeading
        title="Fechas"
        description="Fechas importantes que la gente puede agregar a su calendario."
        actions={
          <Link href="/admin/fechas/nueva" className="boton px-4 py-2">
            Nueva fecha
          </Link>
        }
      />

      {eliminada ? (
        <p className="mb-6 border-2 border-carbon bg-carbon px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper">
          Fecha eliminada.
        </p>
      ) : null}

      {events === null ? (
        <p className="border-2 border-rojo-oscuro p-5 text-sm text-rojo-oscuro">
          No se pudieron cargar las fechas. ¿Ejecutaste 07_fechas.sql en Supabase?
        </p>
      ) : events.length === 0 ? (
        <div className="border-2 border-dashed border-carbon/40 p-10 text-center">
          <p className="titular text-2xl">Todavía no hay fechas</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-carbon/70">
            Crea la primera: un cierre de entregas, un lanzamiento, un evento del colegio.
          </p>
          <Link href="/admin/fechas/nueva" className="boton mt-6 px-4 py-2">
            Crear fecha
          </Link>
        </div>
      ) : (
        <ul className="border-2 border-carbon">
          {events.map((event) => (
            <li
              key={event.id}
              className="grid gap-3 border-b border-carbon/20 p-4 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div className="min-w-0">
                <p className="dato text-rojo">{formatEventWhen(event)}</p>
                <h2 className="titular mt-1 text-xl">
                  <Link href={`/admin/fechas/${event.id}`} className="hover:text-rojo">
                    {event.title}
                  </Link>
                </h2>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <StatusBadge status={event.status} kind="post" />
                  {event.location ? <span className="dato text-carbon/45">{event.location}</span> : null}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <EventRowActions id={event.id} status={event.status} />
                <Link href={`/admin/fechas/${event.id}`} className="boton px-4 py-2">
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