import type { Metadata } from 'next';
import { EditionCard } from '@/components/public/edition-card';
import { EmptyState } from '@/components/public/empty-state';
import { getPublishedEditions } from '@/lib/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Ediciones',
  description: 'Todas las ediciones publicadas de la revista, de la más reciente a la más antigua.',
};

export default async function EditionsPage() {
  const editions = await getPublishedEditions().catch(() => null);

  if (editions === null) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <EmptyState
          title="No se pudieron cargar las ediciones"
          description="Revisa tu conexión y vuelve a cargar la página."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <header className="border-b-2 border-carbon pb-6">
        <h1 className="titular text-[clamp(2.8rem,10vw,6rem)]">Ediciones</h1>
        <p className="dato mt-3 text-carbon/50">
          {editions.length === 0
            ? 'Archivo vacío'
            : `${editions.length} ${editions.length === 1 ? 'edición publicada' : 'ediciones publicadas'}`}
        </p>
      </header>

      {editions.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No hay ediciones publicadas"
            description="Cuando se publique la primera edición aparecerá aquí, con su portada y su lector."
            actionHref="/posts"
            actionLabel="Leer posts"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {editions.map((edition) => (
            <EditionCard key={edition.id} edition={edition} />
          ))}
        </div>
      )}
    </div>
  );
}
