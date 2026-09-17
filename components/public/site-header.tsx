'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function SiteHeader({ magazineName }: { magazineName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-carbon bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logos/esquirla.svg"
            alt="Logo de ESQUIRLA"
            width={36}
            height={36}
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
          <span className="wordmark text-2xl sm:text-3xl">{magazineName}</span>
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'block px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] transition-colors',
                      active ? 'bg-carbon text-paper' : 'hover:bg-rojo hover:text-paper',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-movil"
          className="border-2 border-carbon px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] md:hidden"
        >
          {open ? 'Cerrar' : 'Menú'}
        </button>
      </div>

      {open ? (
        <nav id="menu-movil" aria-label="Principal móvil" className="border-t-2 border-carbon md:hidden">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-carbon/20 last:border-b-0">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3.5 font-mono text-xs uppercase tracking-[0.18em]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
