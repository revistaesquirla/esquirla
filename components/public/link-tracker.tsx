'use client';

import { useEffect } from 'react';
import { trackLinkClick } from '@/actions/links';

/**
 * Cuenta la apertura y, si hay destino, redirige.
 * Los robots de WhatsApp, Instagram, etc. no ejecutan JavaScript: ellos solo
 * leen la vista previa y nunca llegan a redirigir ni a sumar al contador.
 */
export function LinkTracker({ slug, redirectTo }: { slug: string; redirectTo?: string }) {
  useEffect(() => {
    let cancelled = false;
    const track = trackLinkClick(slug).catch(() => undefined);

    if (redirectTo) {
      const wait = new Promise<void>((resolve) => window.setTimeout(resolve, 900));
      Promise.race([track, wait]).then(() => {
        if (!cancelled) window.location.replace(redirectTo);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [slug, redirectTo]);

  return null;
}