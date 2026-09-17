import Link from 'next/link';
import { EditionRowActions } from '@/components/admin/edition-row-actions';
import { PageHeading, StatusBadge } from '@/components/admin/ui';
import { getAllEditions } from '@/lib/queries';
import { formatShortDate, padIssue } from '@/lib/utils';

export default async function AdminEditionsPage({
  searchParams,
}: {
  searchParams: Promise<{ eliminada?: string }>;
}) {
  const { eliminada } = await searchParams;
  const editions = await getAllEditions().catch(() => null);

  return (
    <>
      <PageHeading
        title="Ediciones"
        description="Crea una edición, sube su PDF y publícala. Aparecerá sola en la web."
        actions={
          <Link href="/admin/ediciones/nueva" className="boton px-4 py-2">
            Nueva edición
          </Link>
        }
      />

      {eliminada ? (
        <p className="mb-6 border-2 border-carbon bg-carbon px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper">
          Edición eliminada.
        </p>
      ) : null}

      {editions === null ? (
        <p className="border-2 border-rojo-oscuro p-5 text-sm text-rojo-oscuro">
          No se pudieron cargar las ediciones. Vuelve a cargar la página.
        </p>
      ) : editions.length === 0 ? (
        <div className="border-2 border-dashed border-carbon/40 p-10 text-center">
          <p className="titular text-2xl">Todavía no hay ediciones</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-carbon/70">
            Crea la primera: número, año, título, portada y PDF.
          </p>
          <Link href="/admin/ediciones/nueva" className="boton mt-6 px-4 py-2">
            Crear edición
          </Link>
        </div>
      ) : (
        <ul className="border-2 border-carbon">
          {editions.map((edition) => (
            <li
              key={edition.id}
              className="grid gap-4 border-b border-carbon/20 p-4 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div className="min-w-0">
                <p className="dato text-rojo">
                  Edición {padIssue(edition.issue_number)} · {edition.year}
                </p>
                <h2 className="titular mt-1 text-2xl">
                  <Link href={`/admin/ediciones/${edition.id}`} className="hover:text-rojo">
                    {edition.title}
                  </Link>
                </h2>
                <p className="dato mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-carbon/45">
                  <StatusBadge status={edition.status} />
                  <span>{edition.pdf_url ? 'PDF listo' : 'Sin PDF'}</span>
                  <span>{edition.cover_url ? 'Con portada' : 'Sin portada'}</span>
                  <span>Editada {formatShortDate(edition.updated_at)}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <EditionRowActions
                  id={edition.id}
                  status={edition.status}
                  featured={edition.featured}
                />
                <Link href={`/admin/ediciones/${edition.id}`} className="boton px-4 py-2">
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
