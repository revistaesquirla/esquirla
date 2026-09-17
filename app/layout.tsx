import type { Metadata, Viewport } from 'next';
import { Archivo, Archivo_Black, JetBrains_Mono } from 'next/font/google';
import { getSettings } from '@/lib/queries';
import { siteUrl } from '@/lib/utils';
import './globals.css';

const display = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const sans = Archivo({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings().catch(() => null);
  const name = settings?.magazine_name ?? 'ESQUIRLA';
  const tagline = settings?.tagline ?? 'Una revista hecha por estudiantes.';

  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${name} — revista escolar`, template: `%s · ${name}` },
    description: tagline,
    openGraph: {
      type: 'website',
      siteName: name,
      locale: 'es_CO',
      title: `${name} — revista escolar`,
      description: tagline,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  themeColor: '#0D0C0B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-carbon focus:bg-paper focus:px-4 focus:py-2 focus:font-mono focus:text-xs"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
