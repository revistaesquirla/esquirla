import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PdfReaderLoader } from '@/components/reader/pdf-reader-loader';
import { getEditionById } from '@/lib/queries';
import { padIssue } from '@/lib/utils';

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const edition = await getEditionById(id).catch(() => null);
  if (!edition) return { title: 'Edición no encontrada' };

  return {
    title: `Leer edición ${padIssue(edition.issue_number)} — ${edition.title}`,
    description: edition.description ?? undefined,
    robots: { index: false },
  };
}

export default async function ReaderPage({ params }: Params) {
  const { id } = await params;
  const edition = await getEditionById(id).catch(() => null);

  if (!edition) notFound();

  if (!edition.pdf_url) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-5 px-6">
        <p className="dato text-rojo">Edición {padIssue(edition.issue_number)}</p>
        <h1 className="titular text-4xl sm:text-5xl">Esta edición todavía no tiene PDF</h1>
        <p className="text-carbon/75">
          El archivo aún no se ha subido. Mientras tanto puedes ver su ficha.
        </p>
        <Link href={`/ediciones/${edition.id}`} className="boton">
          Ver la ficha
        </Link>
      </main>
    );
  }

  return (
    <PdfReaderLoader
      fileUrl={edition.pdf_url}
      title={edition.title}
      issueNumber={edition.issue_number}
      year={edition.year}
      editionId={edition.id}
      knownPageCount={edition.page_count}
      backHref={`/ediciones/${edition.id}`}
    />
  );
}
