'use client';

import { useState, useTransition } from 'react';
import type { ActionResult, ContentStatus } from '@/types/database';

/** Publicar / despublicar desde el listado, sin abrir el formulario. */
export function StatusToggle({
  status,
  onToggle,
}: {
  status: ContentStatus;
  onToggle: (next: ContentStatus) => Promise<ActionResult>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPublished = status === 'published';
  const next: ContentStatus = isPublished ? 'draft' : 'published';

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await onToggle(next);
            setError(result.ok ? null : result.error);
          })
        }
        className="border-2 border-carbon px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] transition-colors hover:bg-carbon hover:text-paper disabled:opacity-40"
      >
        {pending ? 'Un momento…' : isPublished ? 'Despublicar' : 'Publicar'}
      </button>
      {error ? <p className="mt-1 text-xs font-bold text-rojo-oscuro">{error}</p> : null}
    </div>
  );
}
