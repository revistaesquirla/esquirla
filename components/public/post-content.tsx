import { VideoEmbed } from '@/components/public/video-embed';

type Part = { type: 'html'; html: string } | { type: 'video'; url: string };

/** Parte el HTML del post en trozos de texto y videos. */
function split(html: string): Part[] {
  const marker = /<div[^>]*?\sdata-video="([^"]*)"[^>]*><\/div>/g;
  const parts: Part[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = marker.exec(html)) !== null) {
    if (match.index > last) parts.push({ type: 'html', html: html.slice(last, match.index) });
    parts.push({ type: 'video', url: match[1].replace(/&amp;/g, '&') });
    last = match.index + match[0].length;
  }
  if (last < html.length) parts.push({ type: 'html', html: html.slice(last) });

  return parts.filter((part) => part.type === 'video' || part.html.trim().length > 0);
}

export function PostContent({ html }: { html: string }) {
  return (
    <div className="mt-10 space-y-6">
      {split(html).map((part, index) =>
        part.type === 'video' ? (
          <VideoEmbed key={index} url={part.url} />
        ) : (
          // El HTML lo genera el editor del panel (solo administradores).
          <div key={index} className="prosa" dangerouslySetInnerHTML={{ __html: part.html }} />
        ),
      )}
    </div>
  );
}