import type { EventRow } from '@/types/events';

type Timing = Pick<EventRow, 'starts_at' | 'ends_at' | 'all_day'>;

const TZ = 'America/Bogota';
// Colombia no cambia de hora en el año: siempre UTC-5.
const OFFSET_MS = -5 * 60 * 60 * 1000;
const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

const dateFormat = new Intl.DateTimeFormat('es-CO', {
  timeZone: TZ,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const timeFormat = new Intl.DateTimeFormat('es-CO', {
  timeZone: TZ,
  hour: 'numeric',
  minute: '2-digit',
});

/** Fecha y hora en Colombia a partir de un instante guardado en UTC. */
export function toBogotaParts(iso: string) {
  const shifted = new Date(new Date(iso).getTime() + OFFSET_MS).toISOString();
  return { date: shifted.slice(0, 10), time: shifted.slice(11, 16) };
}

/** "2026-10-15" + "14:00" (hora de Colombia) → instante real. */
export function toInstant(date: string, time = '00:00') {
  return new Date(`${date}T${time}:00-05:00`);
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const compactDate = (date: string) => date.replace(/-/g, '');
const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function eventRange(event: Timing) {
  if (event.all_day) {
    const start = toBogotaParts(event.starts_at).date;
    const lastRaw = event.ends_at ? toBogotaParts(event.ends_at).date : start;
    const last = lastRaw < start ? start : lastRaw;
    return { allDay: true as const, start, endExclusive: addDays(last, 1) };
  }
  const start = new Date(event.starts_at);
  const end = event.ends_at ? new Date(event.ends_at) : new Date(start.getTime() + 60 * 60 * 1000);
  return { allDay: false as const, start, end };
}

export function isPastEvent(event: Timing, now = new Date()) {
  const range = eventRange(event);
  const end = range.allDay ? toInstant(range.endExclusive) : range.end;
  return end <= now;
}

export function dayBadge(event: Timing) {
  const { date } = toBogotaParts(event.starts_at);
  return { day: String(Number(date.slice(8, 10))), month: MONTHS[Number(date.slice(5, 7)) - 1] };
}

export function formatEventWhen(event: Timing) {
  const range = eventRange(event);

  if (range.allDay) {
    const first = dateFormat.format(toInstant(range.start, '12:00'));
    const lastDate = addDays(range.endExclusive, -1);
    if (lastDate === range.start) return first;
    return `${first} → ${dateFormat.format(toInstant(lastDate, '12:00'))}`;
  }

  const day = dateFormat.format(range.start);
  const startTime = timeFormat.format(range.start);
  if (!event.ends_at) return `${day} · ${startTime}`;

  const sameDay =
    toBogotaParts(range.start.toISOString()).date === toBogotaParts(range.end.toISOString()).date;

  return sameDay
    ? `${day} · ${startTime} – ${timeFormat.format(range.end)}`
    : `${day} ${startTime} → ${dateFormat.format(range.end)} ${timeFormat.format(range.end)}`;
}

export function googleCalendarUrl(event: EventRow) {
  const range = eventRange(event);
  const dates = range.allDay
    ? `${compactDate(range.start)}/${compactDate(range.endExclusive)}`
    : `${utcStamp(range.start)}/${utcStamp(range.end)}`;

  const params = new URLSearchParams({ action: 'TEMPLATE', text: event.title, dates });
  if (event.description) params.set('details', event.description);
  if (event.location) params.set('location', event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function fold(line: string) {
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    parts.push(rest.slice(0, 73));
    rest = ` ${rest.slice(73)}`;
  }
  parts.push(rest);
  return parts.join('\r\n');
}

/** Archivo .ics: lo abren Apple Calendar, Outlook y casi cualquier app de calendario. */
export function buildIcs(event: EventRow, pageUrl: string) {
  const range = eventRange(event);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ESQUIRLA//Calendario//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@esquirla`,
    `DTSTAMP:${utcStamp(new Date())}`,
    range.allDay
      ? `DTSTART;VALUE=DATE:${compactDate(range.start)}`
      : `DTSTART:${utcStamp(range.start)}`,
    range.allDay
      ? `DTEND;VALUE=DATE:${compactDate(range.endExclusive)}`
      : `DTEND:${utcStamp(range.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
  ];

  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  lines.push(`URL:${pageUrl}`, 'END:VEVENT', 'END:VCALENDAR');

  return `${lines.map(fold).join('\r\n')}\r\n`;
}