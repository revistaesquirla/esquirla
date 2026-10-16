import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LinkTracker } from '@/components/public/link-tracker';
import { getLinkBySlug } from '@/lib/links-queries';
import { isHttpUrl } from '@/lib/links';
import { siteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const link = await getLinkBySlug(slug).catch(() => null);

  if (!link || !link.active) {
    return { title: 'Enlace no disponible', robots: { index: false, follow: false } };
  }

  const title = link.og_title || link.page_title || link.label;
  const description = link.og_description || link.page_message?.slice(0, 200) || undefined;
  const image = link.og_image_url ? [{ url: link.og_image_url }] : undefined;

  return {
    // "absolute" evita que se le pegue " · ESQUIRLA" al título de la vista previa.
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${siteUrl()}/l/${link.slug}`,
      images: image,
    },
    twitter: {
      card: link.og_image_url ? 'summary_large_image' : 'summary',
      title,
      description,
      images: link.og_image_url ? [link.og_image_url] : undefined,
    },
  };
}

export default async function LinkPage({ params }: Params) {
  const { slug } = await params;
  const link = await getLinkBySlug(slug).catch(() => null);

  if (!link || !link.active) notFound();

  if (link.mode === 'redirect' && link.target_url && isHttpUrl(link.target_url)) {
    return (
      <main className="grid min-h-dvh place-items-center bg-carbon px-5 text-paper">
        <LinkTracker slug={link.slug} redirectTo={link.target_url} />
        <div className="text-center">
          <p className="dato text-paper/60">Abriendo…</p>
          <a
            href={link.target_url}
            rel="noopener noreferrer"
            className="dato mt-4 inline-block text-paper/50 underline"
          >
            Si no pasa nada, toca aquí
          </a>
        </div>
      </main>
    );
  }

  const buttons = (Array.isArray(link.buttons) ? link.buttons : []).filter(
    (button) => button?.label && button?.url && isHttpUrl(button.url),
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-5 py-16">
      <LinkTracker slug={link.slug} />

      <Link href="/" className="wordmark text-3xl">
        Esquirla
      </Link>

      <h1 className="titular mt-10 text-[clamp(2.4rem,9vw,4.5rem)]">
        {link.page_title || link.label}
      </h1>

      {link.page_message ? (
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-carbon/85">
          {link.page_message}
        </p>
      ) : null}

      {buttons.length > 0 ? (
        <div className="mt-8 flex flex-col gap-3">
          {buttons.map((button, index) => (
            <a
              key={`${button.url}-${index}`}
              href={button.url}
              rel="noopener noreferrer"
              className={`${index === 0 ? 'boton' : 'boton-fantasma'} w-full`}
            >
              {button.label}
            </a>
          ))}
        </div>
      ) : null}
    </main>
  );
}