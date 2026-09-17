'use client';

import { useState, useTransition } from 'react';
import type { ActionResult } from '@/types/database';

/**
 * Botón de acción destructiva en dos pasos: pide confirmación antes de
 * ejecutar. Sirve para eliminar ediciones, posts, categorías y fragmentos.
 */
export function ConfirmAction({
  action,
  label,
  confirmLabel = 'Sí, eliminar',
  question,
  onDone,
}: {
  action: () => Promise<ActionResult>;
  label: string;
  confirmLabel?: string;
  question: string;
  onDone?: (result: ActionResult) => void;
}) {
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!asking) {
    return (
      <div>
        <button type="button" className="boton-peligro" onClick={() => setAsking(true)}>
          {label}
        </button>
        {error ? <p className="mt-2 text-xs font-bold text-rojo-oscuro">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="border-2 border-rojo-oscuro p-4">
      <p className="text-sm font-bold text-rojo-oscuro">{question}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className="boton-peligro"
          onClick={() =>
            startTransition(async () => {
              const result = await action();
              if (!result.ok) {
                setError(result.error);
                setAsking(false);
                return;
              }
              onDone?.(result);
              setAsking(false);
            })
          }
        >
          {pending ? 'Eliminando…' : confirmLabel}
        </button>
        <button type="button" className="boton-fantasma px-4 py-2" onClick={() => setAsking(false)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
