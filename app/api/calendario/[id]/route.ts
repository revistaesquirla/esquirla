import { NextResponse } from 'next/server';
import { buildIcs } from '@/lib/events';
import { getEventById } from '@/lib/events-queries';
import { siteUrl, slugify } from '@/lib/utils';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id).catch(() => null);

  if (!event || event.status !== 'published') {
    return new NextResponse('Fecha no encontrada', { status: 404 });
  }

  return new NextResponse(buildIcs(event, `${siteUrl()}/calendario`), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slugify(event.title) || 'fecha'}.ics"`,
      'Cache-Control': 'public, max-age=300',
    },
  });
}