import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CoverImage } from '@/components/public/cover-image';
import { getEditionById } from '@/lib/queries';
import { formatBytes, formatDate, padIssue } from '@/lib/utils';

export const revalidate = 60;

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const edition = await getEditionById(id).catch(() => null);

  if (!edition) return { title: 'Edición no encontrada' };

  const title = `Edición ${padIssue(edition.issue_number)} — ${edition.title}`;
  const description =
    edition.description ?? `Edición ${padIssue(edition.issue_number)} de ${edition.year}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: edition.cover_url ? [{ url: edition.cover_url }] : undefined,
    },
    twitter: {
      card: edition.cover_url ? 'summary_large_image' : 'summary',
      title,
      description,
      images: edition.cover_url ? [edition.cover_url] : undefined,
    },
  };
}

export default async function EditionPage({ params }: Params) {
  const { id } = await params;
  const edition = await getEditionById(id).catch(() => null);

  if (!edition) notFound();

  const issue = padIssue(edition.issue_number);

  return (
    <article className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <Link href="/ediciones" className="dato text-carbon/50 hover:text-rojo">
        ← Todas las ediciones
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <CoverImage
          src={edition.cover_url}
          alt={`Portada de la edición ${issue}: ${edition.title}`}
          priority
          sizes="(max-width: 1024px) 90vw, 440px"
          className="shadow-block"
          fallbackLabel={`Edición ${issue}`}
        />

        <div>
          <p className="dato text-rojo">
            Esquirla / {issue} · {edition.year}
          </p>

          <h1 className="titular mt-3 text-[clamp(2.5rem,9vw,5.5rem)]">{edition.title}</h1>

          {edition.subtitle ? (
            <p className="mt-3 font-mono text-sm uppercase tracking-[0.14em] text-carbon/60">
              {edition.subtitle}
            </p>
          ) : null}

          {edition.description ? (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-carbon/80">
              {edition.description}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {edition.pdf_url ? (
              <>
                <Link href={`/leer/${edition.id}`} className="boton">
                  Leer en la web
                </Link>
                <a
                  href={edition.pdf_url}
                  download
                  className="boton-fantasma"
                  target="_blank"
                  rel="noreferrer"
                >
                  Descargar PDF
                </a>
              </>
            ) : (
              <p className="border-2 border-dashed border-carbon/40 px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-carbon/60">
                El PDF de esta edición todavía no está disponible
              </p>
            )}
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px border-2 border-carbon bg-carbon sm:grid-cols-3">
            <Detail label="Número" value={issue} />
            <Detail label="Año" value={String(edition.year)} />
            <Detail label="Publicada" value={formatDate(edition.published_at) ?? 'Sin fecha'} />
            {edition.page_count ? (
              <Detail label="Páginas" value={String(edition.page_count)} />
            ) : null}
            {edition.pdf_size ? (
              <Detail label="Peso del PDF" value={formatBytes(edition.pdf_size)} />
            ) : null}
          </dl>
        </div>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper p-4">
      <dt className="dato text-carbon/50">{label}</dt>
      <dd className="mt-1 font-mono text-sm">{value}</dd>
    </div>
  );
}
