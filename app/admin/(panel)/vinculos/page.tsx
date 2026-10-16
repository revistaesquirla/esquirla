import Link from 'next/link';
import { LinkRowActions } from '@/components/admin/link-row-actions';
import { PageHeading } from '@/components/admin/ui';
import { getAllLinks } from '@/lib/links-queries';
import { siteUrl } from '@/lib/utils';

export default async function AdminLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ eliminado?: string }>;
}) {
  const { eliminado } = await searchParams;
  const links = await getAllLinks().catch(() => null);
  const base = siteUrl();

  return (
    <>
      <PageHeading
        title="Vínculos"
        description="Enlaces cortos con vista previa a tu gusto: bromas, rickrolls, avisos."
        actions={
          <Link href="/admin/vinculos/nuevo" className="boton px-4 py-2">
            Nuevo vínculo
          </Link>
        }
      />

      {eliminado ? (
        <p className="mb-6 border-2 border-carbon bg-carbon px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-paper">
          Vínculo eliminado.
        </p>
      ) : null}

      {links === null ? (
        <p className="border-2 border-rojo-oscuro p-5 text-sm text-rojo-oscuro">
          No se pudieron cargar los vínculos. ¿Ejecutaste 08_vinculos.sql en Supabase?
        </p>
      ) : links.length === 0 ? (
        <div className="border-2 border-dashed border-carbon/40 p-10 text-center">
          <p className="titular text-2xl">Todavía no hay vínculos</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-carbon/70">
            Crea el primero y compártelo: la gente verá la vista previa que tú elijas.
          </p>
          <Link href="/admin/vinculos/nuevo" className="boton mt-6 px-4 py-2">
            Crear vínculo
          </Link>
        </div>
      ) : (
        <ul className="border-2 border-carbon">
          {links.map((link) => (
            <li
              key={link.id}
              className="grid gap-3 border-b border-carbon/20 p-4 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div className="min-w-0">
                <p className="dato text-rojo">
                  {link.mode === 'redirect' ? 'Redirige' : 'Página con menú'} · {link.clicks} aperturas
                </p>
                <h2 className="titular mt-1 text-xl">
                  <Link href={`/admin/vinculos/${link.id}`} className="hover:text-rojo">
                    {link.label}
                  </Link>
                </h2>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    className={`inline-block border-2 px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] ${
                      link.active ? 'border-carbon bg-carbon text-paper' : 'border-carbon/40 text-carbon/60'
                    }`}
                  >
                    {link.active ? 'Activo' : 'Pausado'}
                  </span>
                  <span className="break-all font-mono text-xs text-carbon/55">/l/{link.slug}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <LinkRowActions id={link.id} active={link.active} url={`${base}/l/${link.slug}`} />
                <Link href={`/admin/vinculos/${link.id}`} className="boton px-4 py-2">
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