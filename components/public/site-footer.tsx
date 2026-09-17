import Link from 'next/link';
import { NAV_LINKS } from '@/lib/constants';
import { COLEGIO, GRUPO_CREADOR } from '@/lib/credits';

export function SiteFooter({
  magazineName,
  tagline,
  contactEmail,
  instagram,
}: {
  magazineName: string;
  tagline: string | null;
  contactEmail: string | null;
  instagram: string | null;
}) {
  return (
    <footer className="mt-24 border-t-2 border-carbon bg-carbon text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src="/logos/esquirla.svg"
              alt="Logo de ESQUIRLA"
              width={56}
              height={56}
              className="h-10 w-10 sm:h-14 sm:w-14"
            />
            <p className="wordmark text-5xl sm:text-6xl">{magazineName}</p>
          </div>
          {tagline ? <p className="mt-4 max-w-xs text-paper/70">{tagline}</p> : null}
        </div>

        <div className="flex flex-col gap-8 sm:items-end">
          <nav aria-label="Pie de página">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-paper/70 hover:text-rojo"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-1 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-paper/60 sm:text-right">
            {contactEmail ? (
              <p>
                <a href={`mailto:${contactEmail}`} className="hover:text-rojo">
                  {contactEmail}
                </a>
              </p>
            ) : null}
            {instagram ? <p>{instagram}</p> : null}
            <p>{new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 border-t border-paper/15 px-5 py-6">
        <div className="flex flex-wrap items-center gap-6">
          <a
            href={COLEGIO.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 opacity-80 transition-opacity hover:opacity-100"
          >
            <img
              src="/logos/colegio.svg"
              alt={`Logo de ${COLEGIO.nombre}`}
              width={30}
              height={30}
              className="h-6 w-6 sm:h-7 sm:w-7"
            />
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-paper/60">
              {COLEGIO.nombre}
            </span>
          </a>

          <div className="flex items-center gap-2 opacity-80">
            <img
              src="/logos/mamarre-legacy.svg"
              alt={`Logo de ${GRUPO_CREADOR.nombre}`}
              width={30}
              height={30}
              className="h-6 w-6 sm:h-7 sm:w-7"
            />
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-paper/60">
              Un proyecto de {GRUPO_CREADOR.nombre}
            </span>
          </div>
        </div>

        <Link
          href="/sobre"
          className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-paper/40 underline-offset-2 hover:text-rojo hover:underline"
        >
          Créditos completos
        </Link>
      </div>

      <div className="cinta h-2" aria-hidden="true" />
    </footer>
  );
}
