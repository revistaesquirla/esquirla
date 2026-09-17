'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { createUploadTicket, deleteStorageObject, type UploadKind } from '@/actions/storage';
import { optimizeImage } from '@/lib/image';
import { uploadWithProgress } from '@/lib/upload';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_PDF_BYTES,
  MEDIA_BUCKET,
  PDF_BUCKET,
} from '@/lib/constants';
import { formatBytes } from '@/lib/utils';

export type UploadedFile = {
  path: string | null;
  url: string | null;
  size: number | null;
  name: string | null;
};

type BaseProps = {
  kind: UploadKind;
  label: string;
  hint?: string;
  value: UploadedFile;
  onChange: (value: UploadedFile) => void;
};

function useUploader({ kind, value, onChange }: Pick<BaseProps, 'kind' | 'value' | 'onChange'>) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isPdf = kind === 'edition-pdf';

  async function handleFile(file: File) {
    setError(null);

    if (isPdf) {
      if (file.type !== 'application/pdf') {
        setError('El archivo debe ser un PDF.');
        return;
      }
      if (file.size > MAX_PDF_BYTES) {
        setError(`El archivo PDF supera el tamaño permitido (${formatBytes(MAX_PDF_BYTES)}).`);
        return;
      }
    } else {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError('Formato no admitido. Usa JPG, PNG o WebP.');
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`La imagen supera el tamaño permitido (${formatBytes(MAX_IMAGE_BYTES)}).`);
        return;
      }
    }

    const prepared = isPdf ? file : await optimizeImage(file);

    setProgress(0);
    const ticket = await createUploadTicket({
      kind,
      fileName: prepared.name,
      fileType: prepared.type,
      fileSize: prepared.size,
    });

    if (!ticket.ok || !ticket.data) {
      setProgress(null);
      setError(ticket.ok ? 'No se pudo preparar la subida.' : ticket.error);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await uploadWithProgress({
        signedUrl: ticket.data.signedUrl,
        file: prepared,
        onProgress: setProgress,
        signal: controller.signal,
      });

      onChange({
        path: ticket.data.path,
        url: ticket.data.publicUrl,
        size: prepared.size,
        name: prepared.name,
      });
      setProgress(null);
    } catch (uploadError) {
      setProgress(null);
      if (uploadError instanceof DOMException && uploadError.name === 'AbortError') {
        setError('Subida cancelada.');
      } else {
        setError(
          uploadError instanceof Error
            ? uploadError.message
            : 'No se pudo subir el archivo. Inténtalo de nuevo.',
        );
      }
    } finally {
      abortRef.current = null;
    }
  }

  async function remove() {
    if (value.path) {
      await deleteStorageObject(isPdf ? PDF_BUCKET : MEDIA_BUCKET, value.path);
    }
    onChange({ path: null, url: null, size: null, name: null });
    setError(null);
  }

  return { progress, error, handleFile, remove, cancel: () => abortRef.current?.abort() };
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mt-3">
      <div
        className="h-3 w-full border-2 border-carbon"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de la subida"
      >
        <div className="h-full bg-rojo transition-[width] duration-200" style={{ width: `${progress}%` }} />
      </div>
      <p className="dato mt-1 text-carbon/60">Subiendo… {progress}%</p>
    </div>
  );
}

// ── PDF ───────────────────────────────────────────────────────

export function PdfUploader({ label, hint, value, onChange }: Omit<BaseProps, 'kind'>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { progress, error, handleFile, remove, cancel } = useUploader({
    kind: 'edition-pdf',
    value,
    onChange,
  });

  return (
    <div>
      <p className="etiqueta">{label}</p>

      {value.url ? (
        <div className="marco flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate font-mono text-sm">{value.name ?? 'edicion.pdf'}</p>
            <p className="dato mt-1 text-carbon/50">PDF · {formatBytes(value.size)}</p>
          </div>
          <div className="flex gap-2">
            <a href={value.url} target="_blank" rel="noreferrer" className="boton-fantasma px-3 py-2">
              Ver
            </a>
            <button type="button" onClick={remove} className="boton-peligro">
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const file = event.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          className={`border-2 border-dashed p-6 text-center transition-colors ${
            dragging ? 'border-rojo bg-rojo/5' : 'border-carbon/40'
          }`}
        >
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-carbon/70">
            Arrastra el PDF aquí
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={progress !== null}
            className="boton mt-4 px-4 py-2"
          >
            Elegir archivo
          </button>
          <p className="dato mt-3 text-carbon/45">Máximo {formatBytes(MAX_PDF_BYTES)}</p>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
              event.target.value = '';
            }}
          />
        </div>
      )}

      {progress !== null ? (
        <>
          <ProgressBar progress={progress} />
          <button type="button" onClick={cancel} className="dato mt-2 text-rojo-oscuro underline">
            Cancelar subida
          </button>
        </>
      ) : null}

      {error ? <p className="mt-2 text-xs font-bold text-rojo-oscuro">{error}</p> : null}
      {hint && !error && progress === null ? (
        <p className="mt-2 text-xs text-carbon/55">{hint}</p>
      ) : null}
    </div>
  );
}

// ── Imágenes ──────────────────────────────────────────────────

export function ImageUploader({
  kind,
  label,
  hint,
  value,
  onChange,
  aspect = 'aspect-[3/4]',
}: BaseProps & { aspect?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { progress, error, handleFile, remove } = useUploader({ kind, value, onChange });

  return (
    <div>
      <p className="etiqueta">{label}</p>

      {value.url ? (
        <div className="space-y-3">
          <div className={`relative w-full max-w-[220px] overflow-hidden border-2 border-carbon ${aspect}`}>
            <Image src={value.url} alt="Vista previa de la imagen subida" fill sizes="220px" className="object-cover" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} className="boton-fantasma px-3 py-2">
              Reemplazar
            </button>
            <button type="button" onClick={remove} className="boton-peligro">
              Quitar
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-carbon/40 p-6 text-center">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={progress !== null}
            className="boton px-4 py-2"
          >
            Elegir imagen
          </button>
          <p className="dato mt-3 text-carbon/45">JPG, PNG o WebP · máx. {formatBytes(MAX_IMAGE_BYTES)}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = '';
        }}
      />

      {progress !== null ? <ProgressBar progress={progress} /> : null}
      {error ? <p className="mt-2 text-xs font-bold text-rojo-oscuro">{error}</p> : null}
      {hint && !error && progress === null ? (
        <p className="mt-2 text-xs text-carbon/55">{hint}</p>
      ) : null}
    </div>
  );
}
