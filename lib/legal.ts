import { getSettings } from '@/lib/queries';
import { instagramHandle } from '@/lib/utils';

export const LEGAL = {
  // Revisa estos datos antes de publicar.
  actualizado: '16 de octubre de 2026',
  responsable: 'ESQUIRLA, revista escolar hecha por estudiantes',
};

/** Contacto para ejercer derechos: usa el correo de Configuración; si no hay, el Instagram. */
export async function getContactLine() {
  const settings = await getSettings().catch(() => null);
  if (settings?.contact_email) return settings.contact_email;
  const handle = instagramHandle(settings?.instagram ?? null);
  return handle ? `Instagram ${handle}` : 'los canales de contacto publicados en este sitio';
}