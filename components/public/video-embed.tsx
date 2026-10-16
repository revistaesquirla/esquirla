'use client';

import Link from 'next/link';
import { useState } from 'react';
import { parseVideoUrl } from '@/lib/video';

/** Muestra el video solo cuando la persona pulsa Reproducir: sin cookies de terceros antes. */
export function VideoEmbed({ url }: { url: string }) {
  const info = parseVideoUrl(url);
  const [playing, setPlaying] = useState(false);

  if (!info) return null;

  const portrait = info.provider === 'instagram';

  return (
    <div
      className={`relative w-full border-2 border-carbon bg-carbon ${
        portrait ? 'mx-auto h-[34rem] max-w-md' : 'aspect-video'
      }`}
    >
      {playing ? (
        <iframe
          src={info.embedUrl}
          title={`Video de ${info.label}`}
          className="absolute inset-0 h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-4 text-center text-paper">
          <div>
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="border-2 border-paper bg-paper px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-carbon transition-colors hover:bg-rojo hover:text-paper"
            >
              ▶ Reproducir video
            </button>
            <p className="mx-auto mt-4 max-w-xs text-xs leading-relaxed text-paper/65">
              Al reproducir se carga contenido de {info.label}, que puede usar cookies.{' '}
              <Link href="/cookies" className="underline">
                Más información
              </Link>
            </p>
            <a
              href={info.watchUrl}
              target="_blank"
              rel="noreferrer"
              className="dato mt-3 inline-block text-paper/50 underline"
            >
              Abrir en {info.label}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}