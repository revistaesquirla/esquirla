'use client';

import { IMAGE_MAX_DIMENSION } from '@/lib/constants';

/**
 * Reduce la imagen en el navegador antes de subirla: nadie necesita
 * una portada de 6000 px. Si algo falla, devuelve el archivo original
 * para no bloquear al administrador.
 */
export async function optimizeImage(file: File): Promise<File> {
  if (typeof window === 'undefined') return file;
  if (file.type === 'image/gif' || file.type === 'image/avif') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const largestSide = Math.max(bitmap.width, bitmap.height);

    if (largestSide <= IMAGE_MAX_DIMENSION && file.size < 600 * 1024) {
      bitmap.close();
      return file;
    }

    const scale = Math.min(1, IMAGE_MAX_DIMENSION / largestSide);
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.86),
    );

    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') || 'imagen';
    return new File([blob], `${name}.webp`, { type: 'image/webp' });
  } catch {
    return file;
  }
}

/** Lee ancho y alto sin subir nada, para avisar si la imagen es diminuta. */
export async function readImageSize(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}
