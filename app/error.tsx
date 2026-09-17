'use client';

import Link from 'next/link';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-start justify-center gap-6 px-6">
      <p className="dato text-rojo">Algo falló</p>
      <h1 className="titular text-5xl sm:text-7xl">No se pudo cargar esta página</h1>
      <p className="max-w-md text-lg text-carbon/80">
        Puede ser un problema de conexión. Vuelve a intentarlo en unos segundos.
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="boton">
          Reintentar
        </button>
        <Link href="/" className="boton-fantasma">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
