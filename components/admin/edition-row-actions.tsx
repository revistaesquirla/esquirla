'use client';

import { setEditionStatus, setFeaturedEdition } from '@/actions/editions';
import { StatusToggle } from '@/components/admin/status-toggle';
import { useTransition } from 'react';
import type { ContentStatus } from '@/types/database';

export function EditionRowActions({
  id,
  status,
  featured,
}: {
  id: string;
  status: ContentStatus;
  featured: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusToggle status={status} onToggle={(next) => setEditionStatus(id, next)} />

      {featured ? (
        <span className="border-2 border-rojo bg-rojo px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-paper">
          Destacada
        </span>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => void setFeaturedEdition(id))}
          className="border-2 border-carbon/40 px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-carbon/60 transition-colors hover:border-rojo hover:text-rojo disabled:opacity-40"
        >
          {pending ? 'Un momento…' : 'Destacar'}
        </button>
      )}
    </div>
  );
}
