'use server';

import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/supabase/guards';
import { createClient } from '@/lib/supabase/server';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  MEDIA_BUCKET,
  MEDIA_FOLDERS,
  PDF_BUCKET,
} from '@/lib/constants';
import { safeExtension } from '@/lib/utils';
import type { ActionResult } from '@/types/database';

export type UploadKind = 'edition-pdf' | 'edition-cover' | 'post-cover' | 'gallery';

export type UploadTicket = {
  signedUrl: string;
  path: string;
  bucket: string;
  publicUrl: string;
};

function publicUrlFor(bucket: string, path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Genera una URL firmada para subir un archivo.
 *
 * Aquí se valida tipo y tamaño en el servidor. Aunque alguien manipule
 * el formulario, no obtiene la URL. Y aunque la obtuviera, el bucket de
 * Supabase tiene sus propios límites de mime-type y tamaño.
 */
export async function createUploadTicket(input: {
  kind: UploadKind;
  fileName: string;
  fileType: string;
  fileSize: number;
}): Promise<ActionResult<UploadTicket>> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'Tu sesión expiró. Vuelve a iniciar sesión.' };
  }

  const { kind, fileName, fileType, fileSize } = input;
  const isPdf = kind === 'edition-pdf';

  if (isPdf) {
    if (fileType !== 'application/pdf') {
      return { ok: false, error: 'El archivo debe ser un PDF.' };
    }
    if (fileSize > MAX_PDF_BYTES) {
      return {
        ok: false,
        error: `El archivo PDF supera el tamaño permitido (${Math.round(MAX_PDF_BYTES / 1024 / 1024)} MB).`,
      };
    }
  } else {
    if (!ACCEPTED_IMAGE_TYPES.includes(fileType)) {
      return { ok: false, error: 'Formato de imagen no admitido. Usa JPG, PNG o WebP.' };
    }
    if (fileSize > MAX_IMAGE_BYTES) {
      return {
        ok: false,
        error: `La imagen supera el tamaño permitido (${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB).`,
      };
    }
  }

  if (fileSize <= 0) {
    return { ok: false, error: 'El archivo está vacío.' };
  }

  const bucket = isPdf ? PDF_BUCKET : MEDIA_BUCKET;
  const folder = isPdf
    ? 'ediciones'
    : kind === 'edition-cover'
      ? MEDIA_FOLDERS.covers
      : kind === 'post-cover'
        ? MEDIA_FOLDERS.posts
        : MEDIA_FOLDERS.gallery;

  const extension = safeExtension(fileName, isPdf ? 'pdf' : 'webp');
  const path = `${folder}/${randomUUID()}.${extension}`;

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

  if (error || !data) {
    return { ok: false, error: 'No se pudo preparar la subida. Inténtalo de nuevo.' };
  }

  return {
    ok: true,
    data: {
      signedUrl: data.signedUrl,
      path,
      bucket,
      publicUrl: publicUrlFor(bucket, path),
    },
  };
}

/** Borra un archivo de Storage. Se usa al reemplazar o eliminar contenido. */
export async function deleteStorageObject(bucket: string, path: string): Promise<ActionResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: 'No tienes permiso para borrar archivos.' };
  }

  if (![MEDIA_BUCKET, PDF_BUCKET].includes(bucket)) {
    return { ok: false, error: 'Ubicación de archivo desconocida.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) return { ok: false, error: 'No se pudo borrar el archivo.' };
  return { ok: true };
}
