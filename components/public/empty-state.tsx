import Link from 'next/link';

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="border-2 border-dashed border-carbon/40 px-6 py-16 text-center">
      <p className="titular text-2xl">{title}</p>
      <p className="mx-auto mt-3 max-w-sm text-sm text-carbon/70">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="boton mt-6 px-4 py-2">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
