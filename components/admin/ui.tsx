'use client';

import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';
import { POST_STATUS_LABELS, STATUS_LABELS } from '@/lib/constants';
import type { ContentStatus } from '@/types/database';

export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-carbon pb-5">
      <div>
        <h1 className="titular text-3xl sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-lg text-sm text-carbon/70">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function SubmitButton({
  children,
  pendingLabel = 'Guardando…',
  className,
  variant = 'solid',
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: 'solid' | 'ghost';
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(variant === 'solid' ? 'boton' : 'boton-fantasma', className)}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function StatusBadge({ status, kind = 'edition' }: { status: ContentStatus; kind?: 'edition' | 'post' }) {
  const labels = kind === 'post' ? POST_STATUS_LABELS : STATUS_LABELS;

  return (
    <span
      className={cn(
        'inline-block border-2 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em]',
        status === 'published' && 'border-carbon bg-carbon text-paper',
        status === 'draft' && 'border-carbon/40 text-carbon/60',
        status === 'hidden' && 'border-rojo-oscuro text-rojo-oscuro',
      )}
    >
      {labels[status]}
    </span>
  );
}

export function Feedback({
  tone,
  children,
}: {
  tone: 'ok' | 'error';
  children: React.ReactNode;
}) {
  if (!children) return null;

  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'border-2 px-4 py-3 font-mono text-xs uppercase tracking-[0.12em]',
        tone === 'error' ? 'border-rojo-oscuro text-rojo-oscuro' : 'border-carbon bg-carbon text-paper',
      )}
    >
      {children}
    </p>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  errors,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  errors?: string[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="etiqueta">
        {label}
      </label>
      {children}
      {hint && !errors?.length ? <p className="mt-1 text-xs text-carbon/55">{hint}</p> : null}
      {errors?.length ? (
        <p className="mt-1 text-xs font-bold text-rojo-oscuro">{errors[0]}</p>
      ) : null}
    </div>
  );
}
