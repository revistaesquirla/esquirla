'use client';

import { useState, useTransition } from 'react';
import { toggleLink } from '@/actions/links';
import { CopyButton } from '@/components/admin/copy-button';

export function LinkRowActions({
  id,
  active,
  url,
}: {
  id: string;
  active: boolean;
  url: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={url} />
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await toggleLink(id, !active);
              setError(result.ok ? null : result.error);
            })
          }
          className="border-2 border-carbon px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] transition-colors hover:bg-carbon hover:text-paper disabled:opacity-40"
        >
          {pending ? 'Un momento…' : active ? 'Pausar' : 'Activar'}
        </button>
      </div>
      {error ? <p className="mt-1 text-xs font-bold text-rojo-oscuro">{error}</p> : null}
    </div>
  );
}