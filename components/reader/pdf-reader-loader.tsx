'use client';

import dynamic from 'next/dynamic';
import type { PdfReaderProps } from '@/components/reader/pdf-reader';

// react-pdf necesita el navegador: nada de renderizado en el servidor.
const PdfReader = dynamic(() => import('@/components/reader/pdf-reader'), {
  ssr: false,
  loading: () => (
    <div className="grid h-dvh place-items-center bg-carbon">
      <p className="dato text-paper/60">Abriendo el lector…</p>
    </div>
  ),
});

export function PdfReaderLoader(props: PdfReaderProps) {
  return <PdfReader {...props} />;
}
