'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ADMIN_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function AdminShell({
  email,
  children,
}: {
  email: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[230px_1fr]">
      <aside className="border-carbon bg-carbon text-paper lg:sticky lg:top-0 lg:h-dvh lg:border-r-2">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <div>
            <Link href="/admin" className="wordmark text-2xl">
              Esquirla
            </Link>
            <p className="dato mt-1 text-paper/45">Panel</p>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="border-2 border-paper/30 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] lg:hidden"
          >
            {open ? 'Cerrar' : 'Menú'}
          </button>
        </div>

        <nav
          aria-label="Panel"
          className={cn('px-3 pb-4 lg:block lg:pt-2', open ? 'block' : 'hidden')}
        >
          <ul className="space-y-1">
            {ADMIN_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block px-3 py-2.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors',
                    isActive(link.href) ? 'bg-rojo text-paper' : 'text-paper/70 hover:bg-paper/10',
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t-2 border-paper/15 pt-4">
            <Link
              href="/"
              target="_blank"
              className="block px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-paper/60 hover:text-rojo"
            >
              Ver el sitio ↗
            </Link>

            {email ? <p className="truncate px-3 py-2 font-mono text-[0.62rem] text-paper/35">{email}</p> : null}

            <form action="/auth/signout" method="post" className="px-3 pt-1">
              <button
                type="submit"
                className="w-full border-2 border-paper/30 px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] hover:bg-rojo hover:border-rojo"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </nav>
      </aside>

      <div className="min-w-0 px-5 py-8 sm:px-8">{children}</div>
    </div>
  );
}
