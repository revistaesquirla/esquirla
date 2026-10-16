import type { Metadata } from 'next';
import { EmptyState } from '@/components/public/empty-state';
import { dayBadge, formatEventWhen, googleCalendarUrl, isPastEvent } from '@/lib/events';
import { getPublishedEvents } from '@/lib/events-queries';
import type { EventRow } from '@/types/events';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Calendario',
  description: 'Fechas importantes de la revista. Agrégalas a tu calendario para no perdértelas.',
};

export default async function CalendarPage() {
  const events = await getPublishedEvents().catch(() => null);

  if (events === null) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16">
        <EmptyState
          title="No se pudo cargar el calendario"
          description="Revisa tu conexión y vuelve a cargar la página."
        />
      </div>
    );
  }

  const now = new Date();
  const upcoming = events.filter((event) => !isPastEvent(event, now));
  const past = events.filter((event) => isPastEvent(event, now)).reverse();

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <header className="border-b-2 border-carbon pb-6">
        <h1 className="titular text-[clamp(2.8rem,10vw,6rem)]">Calendario</h1>
        <p className="mt-4 max-w-xl text-lg text-carbon/80">
          Las fechas que no te puedes perder. Agrégalas a tu calendario con un clic.
        </p>
      </header>

      <div className="mt-10 space-y-4">
        {upcoming.length > 0 ? (
          <ul className="space-y-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No hay fechas próximas"
            description="Cuando se publique una nueva fecha importante aparecerá aquí."
          />
        )}
      </div>

      {past.length > 0 ? (
        <details className="mt-12 border-2 border-carbon">
          <summary className="cursor-pointer px-5 py-4 font-mono text-xs uppercase tracking-[0.16em] transition-colors hover:bg-carbon hover:text-paper">
            Fechas pasadas ({past.length})
          </summary>
          <ul className="space-y-4 border-t-2 border-carbon p-5">
            {past.map((event) => (
              <EventCard key={event.id} event={event} past />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function EventCard({ event, past = false }: { event: EventRow; past?: boolean }) {
  const badge = dayBadge(event);

  return (
    <li
      className={`grid gap-5 border-2 border-carbon bg-paper p-5 sm:grid-cols-[88px_1fr] ${
        past ? 'opacity-60' : ''
      }`}
    >
      <div className="flex h-20 w-20 flex-col items-center justify-center border-2 border-carbon bg-carbon text-paper">
        <span className="titular text-3xl">{badge.day}</span>
        <span className="dato">{badge.month}</span>
      </div>

      <div className="min-w-0">
        <p className="dato text-rojo">{formatEventWhen(event)}</p>
        <h2 className="titular mt-1 text-2xl">{event.title}</h2>
        {event.location ? <p className="dato mt-2 text-carbon/55">{event.location}</p> : null}
        {event.description ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-carbon/80">
            {event.description}
          </p>
        ) : null}

        {!past ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={googleCalendarUrl(event)} target="_blank" rel="noreferrer" className="boton px-4 py-2">
              Google Calendar
            </a>
            <a href={`/api/calendario/${event.id}`} className="boton-fantasma px-4 py-2">
              Apple / Outlook (.ics)
            </a>
          </div>
        ) : null}
      </div>
    </li>
  );
}