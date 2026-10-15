import Link from 'next/link';
import { SubmissionActions } from '@/components/admin/submission-actions';
import { PageHeading } from '@/components/admin/ui';
import { createClient } from '@/lib/supabase/server';
import { cn, formatShortDate } from '@/lib/utils';
import type { Submission } from '@/types/submissions';

const STATUS_TABS = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Descartadas' },
  { value: 'todas', label: 'Todas' },
];

const KIND_TABS = [
  { value: 'todos', label: 'Todos' },
  { value: 'fragment', label: 'Fragmentos' },
  { value: 'participa', label: 'Participa' },
];

type Props = { searchParams: Promise<{ estado?: string; tipo?: string }> };

export default async function SolicitudesPage({ searchParams }: Props) {
  const { estado = 'pending', tipo = 'todos' } = await searchParams;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false });

  const all = (data ?? []) as Submission[];
  const pendingCount = all.filter((item) => item.status === 'pending').length;

  const items = all.filter(
    (item) =>
      (estado === 'todas' || item.status === estado) && (tipo === 'todos' || item.kind === tipo),
  );

  const href = (nextEstado: string, nextTipo: string) =>
    `/admin/solicitudes?estado=${nextEstado}&tipo=${nextTipo}`;

  return (
    <>
      <PageHeading
        title="Solicitudes"
        description={`Lo que envían los estudiantes desde la web. ${pendingCount} pendiente${pendingCount === 1 ? '' : 's'}.`}
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={href(tab.value, tipo)}
            className={cn(
              'border-2 border-carbon px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em]',
              estado === tab.value ? 'bg-carbon text-paper' : 'hover:bg-rojo hover:text-paper',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {KIND_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={href(estado, tab.value)}
            className={cn(
              'border-2 border-carbon/40 px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.14em]',
              tipo === tab.value ? 'border-carbon bg-carbon text-paper' : 'hover:border-rojo hover:text-rojo',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {error ? (
        <p className="border-2 border-rojo-oscuro p-5 text-sm text-rojo-oscuro">
          No se pudieron cargar las solicitudes. ¿Ejecutaste el archivo 06_solicitudes.sql en Supabase?
        </p>
      ) : items.length === 0 ? (
        <div className="border-2 border-dashed border-carbon/40 p-10 text-center">
          <p className="titular text-2xl">No hay solicitudes aquí</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-carbon/70">
            Cuando alguien envíe un fragmento o una propuesta desde la web, aparecerá en esta lista.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.id} className="marco p-5">
              <p className="dato text-rojo">
                {item.kind === 'fragment' ? 'Fragmento' : `Participa · ${item.topic ?? 'Sin tema'}`}
                <span className="text-carbon/45"> · {formatShortDate(item.created_at)}</span>
              </p>

              <p className="mt-3 whitespace-pre-line text-lg leading-snug">{item.body}</p>

              <p className="dato mt-3 text-carbon/55">
                {item.name || 'Anónimo'}
                {item.contact ? ` · ${item.contact}` : ''}
              </p>

              <div className="mt-5 border-t border-carbon/20 pt-4">
                <SubmissionActions
                  id={item.id}
                  status={item.status}
                  approveLabel={item.kind === 'fragment' ? 'Aprobar y publicar' : 'Marcar como aceptada'}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}