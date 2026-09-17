import Link from 'next/link';
import { PageHeading, StatusBadge } from '@/components/admin/ui';
import { getDashboardStats } from '@/lib/queries';
import { formatShortDate, padIssue } from '@/lib/utils';

export default async function DashboardPage() {
  const stats = await getDashboardStats().catch(() => null);

  if (!stats) {
    return (
      <>
        <PageHeading title="Panel" />
        <p className="border-2 border-rojo-oscuro p-5 text-sm text-rojo-oscuro">
          No se pudieron cargar los datos. Comprueba las variables de entorno de Supabase y vuelve a
          cargar la página.
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeading
        title="Panel"
        description="Todo lo que publiques aquí aparece en la web al instante."
        actions={
          <>
            <Link href="/admin/ediciones/nueva" className="boton px-4 py-2">
              Nueva edición
            </Link>
            <Link href="/admin/posts/nuevo" className="boton-fantasma px-4 py-2">
              Nuevo post
            </Link>
          </>
        }
      />

      <section className="grid gap-px border-2 border-carbon bg-carbon sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Ediciones" value={stats.editionsTotal} detail={`${stats.editionsPublished} publicadas`} />
        <Stat label="Posts" value={stats.postsTotal} detail={`${stats.postsPublished} publicados`} />
        <Stat
          label="Publicado"
          value={stats.editionsPublished + stats.postsPublished}
          detail="Visible en la web"
        />
        <Stat
          label="En borrador"
          value={stats.editionsDraft + stats.postsDraft}
          detail="Sin publicar todavía"
          highlight={stats.editionsDraft + stats.postsDraft > 0}
        />
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="titular text-2xl">Última edición</h2>

          {stats.latestEdition ? (
            <article className="marco mt-4 p-5">
              <p className="dato text-rojo">
                Edición {padIssue(stats.latestEdition.issue_number)} · {stats.latestEdition.year}
              </p>
              <h3 className="titular mt-2 text-3xl">{stats.latestEdition.title}</h3>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <StatusBadge status={stats.latestEdition.status} />
                {stats.latestEdition.featured ? (
                  <span className="dato text-rojo">Destacada</span>
                ) : null}
                <span className="dato text-carbon/45">
                  {stats.latestEdition.pdf_url ? 'PDF listo' : 'Sin PDF'}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/admin/ediciones/${stats.latestEdition.id}`} className="boton px-4 py-2">
                  Editar
                </Link>
                <Link
                  href={`/ediciones/${stats.latestEdition.id}`}
                  target="_blank"
                  className="boton-fantasma px-4 py-2"
                >
                  Ver
                </Link>
              </div>
            </article>
          ) : (
            <div className="mt-4 border-2 border-dashed border-carbon/40 p-6">
              <p className="text-sm text-carbon/70">
                Todavía no hay ninguna edición. Crea la primera y sube su PDF.
              </p>
              <Link href="/admin/ediciones/nueva" className="boton mt-4 px-4 py-2">
                Crear edición
              </Link>
            </div>
          )}
        </section>

        <section>
          <h2 className="titular text-2xl">Publicaciones recientes</h2>

          {stats.recentPosts.length > 0 ? (
            <ul className="mt-4 border-2 border-carbon">
              {stats.recentPosts.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-carbon/20 p-4 last:border-b-0"
                >
                  <div className="min-w-0">
                    <Link href={`/admin/posts/${post.id}`} className="font-bold hover:text-rojo">
                      {post.title}
                    </Link>
                    <p className="dato mt-1 text-carbon/45">
                      {[post.category?.name, formatShortDate(post.updated_at)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <StatusBadge status={post.status} kind="post" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 border-2 border-dashed border-carbon/40 p-6">
              <p className="text-sm text-carbon/70">Todavía no hay posts.</p>
              <Link href="/admin/posts/nuevo" className="boton mt-4 px-4 py-2">
                Escribir el primero
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  detail,
  highlight = false,
}: {
  label: string;
  value: number;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div className={highlight ? 'bg-rojo p-5 text-paper' : 'bg-paper p-5'}>
      <p className={`dato ${highlight ? 'text-paper/70' : 'text-carbon/50'}`}>{label}</p>
      <p className="titular mt-2 text-5xl">{value}</p>
      <p className={`mt-1 text-xs ${highlight ? 'text-paper/70' : 'text-carbon/55'}`}>{detail}</p>
    </div>
  );
}
