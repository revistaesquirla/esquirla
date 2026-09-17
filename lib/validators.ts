import { z } from 'zod';

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  trimmed(max)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null));

export const statusSchema = z.enum(['draft', 'published', 'hidden']);

export const editionSchema = z.object({
  issue_number: z.coerce
    .number({ invalid_type_error: 'El número de edición debe ser un número.' })
    .int('El número de edición debe ser entero.')
    .min(1, 'El número de edición empieza en 1.')
    .max(999, 'Número de edición demasiado alto.'),
  year: z.coerce
    .number({ invalid_type_error: 'El año debe ser un número.' })
    .int()
    .min(2000, 'Año demasiado antiguo.')
    .max(2100, 'Año demasiado lejano.'),
  title: trimmed(120).min(2, 'El título necesita al menos 2 caracteres.'),
  subtitle: optionalText(160),
  description: optionalText(1000),
  cover_path: optionalText(400),
  cover_url: optionalText(800),
  pdf_path: optionalText(400),
  pdf_url: optionalText(800),
  pdf_size: z.coerce.number().int().nonnegative().nullable().optional(),
  status: statusSchema,
  featured: z.coerce.boolean().default(false),
  published_at: optionalText(40),
});

export type EditionInput = z.infer<typeof editionSchema>;

export const postSchema = z.object({
  title: trimmed(160).min(2, 'El título necesita al menos 2 caracteres.'),
  slug: trimmed(90)
    .min(2, 'La URL del post no puede quedar vacía.')
    .regex(/^[a-z0-9-]+$/, 'La URL solo admite minúsculas, números y guiones.'),
  subtitle: optionalText(200),
  excerpt: optionalText(320),
  content_html: optionalText(200000),
  content_json: optionalText(400000),
  cover_path: optionalText(400),
  cover_url: optionalText(800),
  author: optionalText(120),
  category_id: z
    .string()
    .uuid('Categoría inválida.')
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
  status: statusSchema,
  featured: z.coerce.boolean().default(false),
  published_at: optionalText(40),
});

export type PostInput = z.infer<typeof postSchema>;

export const categorySchema = z.object({
  name: trimmed(60).min(2, 'El nombre necesita al menos 2 caracteres.'),
});

export const fragmentSchema = z.object({
  kind: z.enum(['quote', 'photo', 'excerpt']),
  body: optionalText(400),
  attribution: optionalText(120),
  image_path: optionalText(400),
  image_url: optionalText(800),
  post_id: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
  status: statusSchema,
  position: z.coerce.number().int().min(0).max(999).default(0),
});

export const settingsSchema = z.object({
  magazine_name: trimmed(60).min(2, 'El nombre de la revista no puede quedar vacío.'),
  tagline: optionalText(200),
  about_text: optionalText(6000),
  participa_text: optionalText(6000),
  contact_email: z
    .union([z.string().trim().email('Correo inválido.'), z.literal('')])
    .transform((value) => (value ? value : null)),
  instagram: optionalText(120),
});

/** Convierte los errores de Zod al formato que usan los formularios. */
export function toFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}
