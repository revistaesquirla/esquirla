import Link from 'next/link';
import { CoverImage } from '@/components/public/cover-image';
import { formatDate, padIssue } from '@/lib/utils';
import type { Edition } from '@/types/database';

export function EditionCard({ edition }: { edition: Edition }) {
  const issue = padIssue(edition.issue_number);
  const date = formatDate(edition.published_at);

  return (
    <article className="group flex flex-col border-2 border-carbon bg-paper transition-shadow duration-200 hover:shadow-block">
      <Link href={`/ediciones/${edition.id}`} className="block" aria-label={`Edición ${issue}: ${edition.title}`}>
        <CoverImage
          src={edition.cover_url}
          alt={`Portada de la edición ${issue}: ${edition.title}`}
          className="border-0 border-b-2"
          fallbackLabel={`Edición ${issue}`}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="dato text-rojo">
          Esquirla / {issue} · {edition.year}
        </p>

        <h3 className="titular text-2xl">
          <Link href={`/ediciones/${edition.id}`} className="hover:text-rojo">
            {edition.title}
          </Link>
        </h3>

        {edition.description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-carbon/75">{edition.description}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {date ? <span className="dato text-carbon/50">{date}</span> : <span />}
          <Link
            href={edition.pdf_url ? `/leer/${edition.id}` : `/ediciones/${edition.id}`}
            className="boton px-4 py-2"
          >
            {edition.pdf_url ? 'Leer edición' : 'Ver ficha'}
          </Link>
        </div>
      </div>
    </article>
  );
}
