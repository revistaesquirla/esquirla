import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col items-start justify-center gap-6 px-6">
      <p className="dato text-rojo">Error 404</p>
      <h1 className="titular text-6xl sm:text-8xl">Esta página se rompió</h1>
      <p className="max-w-md text-lg text-carbon/80">
        La dirección no existe o el contenido dejó de estar publicado.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="boton">
          Volver al inicio
        </Link>
        <Link href="/ediciones" className="boton-fantasma">
          Ver ediciones
        </Link>
      </div>
    </main>
  );
}
