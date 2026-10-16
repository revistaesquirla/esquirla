export type VideoInfo = {
  provider: 'youtube' | 'vimeo' | 'instagram';
  label: string;
  embedUrl: string;
  watchUrl: string;
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const INSTAGRAM_CODE = /^[A-Za-z0-9_-]{5,40}$/;

/** Solo acepta YouTube, Vimeo e Instagram. Devuelve null para cualquier otra cosa. */
export function parseVideoUrl(raw: string | null | undefined): VideoInfo | null {
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw.trim().replace(/&amp;/g, '&'));
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  const parts = url.pathname.split('/').filter(Boolean);

  // YouTube
  let youtubeId: string | null = null;
  if (host === 'youtu.be') youtubeId = parts[0] ?? null;
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (parts[0] === 'watch') youtubeId = url.searchParams.get('v');
    else if (['shorts', 'embed', 'live', 'v'].includes(parts[0] ?? '')) youtubeId = parts[1] ?? null;
  }
  if (youtubeId && YOUTUBE_ID.test(youtubeId)) {
    return {
      provider: 'youtube',
      label: 'YouTube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
      watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    };
  }

  // Vimeo
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const segments = parts[0] === 'video' ? parts.slice(1) : parts;
    const id = segments[0];
    const hash = segments[1] ?? url.searchParams.get('h');
    if (id && /^\d{6,12}$/.test(id)) {
      const suffix = hash && /^[a-z0-9]+$/i.test(hash) ? `?h=${hash}` : '';
      return {
        provider: 'vimeo',
        label: 'Vimeo',
        embedUrl: `https://player.vimeo.com/video/${id}${suffix}`,
        watchUrl: `https://vimeo.com/${id}`,
      };
    }
  }

  // Instagram (reels, publicaciones y tv)
  if (host === 'instagram.com') {
    const index = parts.findIndex((part) => ['reel', 'reels', 'p', 'tv'].includes(part));
    const code = index >= 0 ? parts[index + 1] : undefined;
    if (code && INSTAGRAM_CODE.test(code)) {
      const kind = parts[index] === 'reels' ? 'reel' : parts[index];
      return {
        provider: 'instagram',
        label: 'Instagram',
        embedUrl: `https://www.instagram.com/${kind}/${code}/embed`,
        watchUrl: `https://www.instagram.com/${kind}/${code}/`,
      };
    }
  }

  return null;
}