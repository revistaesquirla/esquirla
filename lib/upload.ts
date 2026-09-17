'use client';

/**
 * Sube un archivo a una URL firmada de Supabase Storage usando XHR,
 * que sí reporta progreso real (fetch todavía no lo hace).
 * La URL firmada la genera una server action que comprueba que quien
 * sube sea administrador, así que esto no es una subida "de confianza".
 */
export function uploadWithProgress(options: {
  signedUrl: string;
  file: File;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { signedUrl, file, onProgress, signal } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl, true);
    xhr.setRequestHeader('content-type', file.type || 'application/octet-stream');
    xhr.setRequestHeader('x-upsert', 'true');
    xhr.setRequestHeader('cache-control', 'max-age=3600');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else if (xhr.status === 413) {
        reject(new Error('El archivo supera el tamaño permitido por el servidor.'));
      } else {
        reject(new Error('El servidor rechazó el archivo. Revisa el formato y vuelve a intentarlo.'));
      }
    };

    xhr.onerror = () => reject(new Error('Se perdió la conexión durante la subida.'));
    xhr.onabort = () => reject(new DOMException('Subida cancelada', 'AbortError'));

    signal?.addEventListener('abort', () => xhr.abort(), { once: true });

    xhr.send(file);
  });
}
