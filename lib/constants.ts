import type { ContentStatus } from '@/types/database';

export const SITE_NAME = 'ESQUIRLA';

export const MEDIA_BUCKET = 'media';
export const PDF_BUCKET = 'pdfs';

/** Carpetas lógicas dentro del bucket "media". */
export const MEDIA_FOLDERS = {
  covers: 'covers',
  posts: 'posts',
  gallery: 'gallery',
} as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[keyof typeof MEDIA_FOLDERS];

/** Debe coincidir con file_size_limit de los buckets en 03_storage.sql. */
export const MAX_PDF_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

/** Lado mayor al que se reduce una imagen antes de subirla. */
export const IMAGE_MAX_DIMENSION = 1800;

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Borrador',
  published: 'Publicada',
  hidden: 'Oculta',
};

export const POST_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  hidden: 'Oculto',
};

export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/ediciones', label: 'Ediciones' },
  { href: '/posts', label: 'Posts' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/participa', label: 'Participa' },
];

export const ADMIN_LINKS = [
  { href: '/admin', label: 'Panel' },
  { href: '/admin/ediciones', label: 'Ediciones' },
  { href: '/admin/posts', label: 'Posts' },
  { href: '/admin/fragmentos', label: 'Fragmentos' },
  { href: '/admin/configuracion', label: 'Configuración' },
];
