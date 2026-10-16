'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { NotificationItem } from '@/types/notifications';

const STORAGE_KEY = 'esquirla:notificaciones-vistas';

const TYPE_LABELS: Record<NotificationItem['type'], string> = {
  edition: 'Nueva edición',
  post: 'Nuevo post',
  event: 'Próxima fecha',
};

function readSeen(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeSeen(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(-100)));
  } catch {
    // Sin almacenamiento disponible: no pasa nada, solo no se recuerda lo leído.
  }
}

export function NotificationBell({ items }: { items: NotificationItem[] }) {
  const [seen, setSeen] = useState<string[] | null>(null);
  const [open, setOpen] = useState(false);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSeen(readSeen());
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const unread = seen === null ? 0 : items.filter((item) => !seen.includes(item.id)).length;

  function toggle() {
    if (!open) {
      const current = seen ?? readSeen();
      setFresh(new Set(items.filter((item) => !current.includes(item.id)).map((item) => item.id)));
      const merged = [...current, ...items.map((item) => item.id).filter((id) => !current.includes(id))];
      writeSeen(merged);
      setSeen(merged);
    }
    setOpen((value) => !value);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={unread > 0 ? `Novedades: ${unread} sin leer` : 'Novedades'}
        className="relative border-2 border-carbon p-2 transition-colors hover:bg-rojo hover:text-paper"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-2 -top-2 grid min-w-5 place-items-center border-2 border-carbon bg-rojo px-1 font-mono text-[0.6rem] leading-4 text-paper">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="region"
          aria-label="Novedades"
          className="fixed left-3 right-3 top-[3.9rem] z-50 max-h-[70vh] overflow-y-auto border-2 border-carbon bg-paper shadow-block sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
        >
          <p className="border-b-2 border-carbon px-4 py-3 font-mono text-[0.68rem] uppercase tracking-[0.16em]">
            Novedades
          </p>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-carbon/70">Todavía no hay novedades.</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id} className="border-b border-carbon/15 last:border-b-0">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 transition-colors hover:bg-carbon hover:text-paper"
                  >
                    <span className="dato flex items-center gap-2 text-rojo">
                      {fresh.has(item.id) ? (
                        <span className="h-2 w-2 bg-rojo" aria-label="Nuevo" />
                      ) : null}
                      {TYPE_LABELS[item.type]}
                    </span>
                    <span className="mt-1 block font-bold leading-snug">{item.title}</span>
                    {item.detail ? (
                      <span className="mt-1 block text-xs opacity-65">{item.detail}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}