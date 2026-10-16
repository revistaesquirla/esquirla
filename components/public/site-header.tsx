'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV_LINKS } from '@/lib/constants';
import { InstagramIcon } from '@/components/public/instagram-icon';
import { cn, instagramHandle, instagramUrl } from '@/lib/utils';

export function SiteHeader({
  magazineName,
  instagram,
  bell,
}: {
  magazineName: string;
  instagram: string | null;
  bell?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const igUrl = instagramUrl(instagram);
  const igHandle = instagramHandle(instagram);

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

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 lg:flex">
            <nav aria-label="Principal">
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

            {igUrl ? (
              <a
                href={igUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Instagram${igHandle ? `: ${igHandle}` : ''}`}
                className="ml-2 border-2 border-carbon p-2 transition-colors hover:bg-rojo hover:text-paper"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            ) : null}
          </div>

          {bell}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            className="border-2 border-carbon px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] lg:hidden"
          >
            {open ? 'Cerrar' : 'Menú'}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="menu-movil" aria-label="Principal móvil" className="border-t-2 border-carbon lg:hidden">
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
          {igUrl ? (
            <a
              href={igUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 border-t-2 border-carbon px-5 py-3.5 font-mono text-xs uppercase tracking-[0.18em]"
            >
              <InstagramIcon className="h-4 w-4" />
              {igHandle ?? 'Instagram'}
            </a>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}