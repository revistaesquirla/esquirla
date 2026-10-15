'use client';

import { useState, useTransition } from 'react';
import { approveSubmission, deleteSubmission, rejectSubmission } from '@/actions/submissions';
import { ConfirmAction } from '@/components/admin/confirm-action';
import type { SubmissionStatus } from '@/types/submissions';

export function SubmissionActions({
  id,
  status,
  approveLabel,
}: {
  id: string;
  status: SubmissionStatus;
  approveLabel: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: (id: string) => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action(id);
      setError(result.ok ? null : (result.error ?? 'No se pudo completar la acción.'));
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status !== 'approved' ? (
          <button type="button" disabled={pending} onClick={() => run(approveSubmission)} className="boton px-4 py-2">
            {pending ? 'Un momento…' : approveLabel}
          </button>
        ) : null}
        {status !== 'rejected' ? (
          <button type="button" disabled={pending} onClick={() => run(rejectSubmission)} className="boton-fantasma px-4 py-2">
            Descartar
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs font-bold text-rojo-oscuro">{error}</p> : null}
      <ConfirmAction
        action={() => deleteSubmission(id)}
        label="Eliminar"
        question="¿Eliminar esta solicitud definitivamente?"
      />
    </div>
  );
}