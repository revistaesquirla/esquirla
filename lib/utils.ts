export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

/** "El Escenario" → "el-escenario" */
export function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatShortDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

/** "01", "02"… para los números de edición. */
export function padIssue(issueNumber: number) {
  return String(issueNumber).padStart(2, '0');
}

/** Quita etiquetas y recorta, para generar resúmenes y metadatos. */
export function htmlToPlainText(html: string | null | undefined, maxLength = 180) {
  if (!html) return '';
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function readingMinutes(html: string | null | undefined) {
  const words = htmlToPlainText(html, Number.MAX_SAFE_INTEGER).split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

/** Extensión segura a partir del nombre original del archivo. */
export function safeExtension(fileName: string, fallback: string) {
  const match = /\.([a-z0-9]{1,5})$/i.exec(fileName.trim());
  return match ? match[1].toLowerCase() : fallback;
}
