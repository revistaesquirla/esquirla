import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc, LegalSection } from '@/components/public/legal-doc';
import { LEGAL } from '@/lib/legal';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Política de cookies',
  description: 'Qué cookies y almacenamiento usa el sitio, y cómo se cargan los videos incrustados.',
};

export default function CookiesPage() {
  return (
    <LegalDoc title="Política de cookies" updated={LEGAL.actualizado}>
      <LegalSection title="Resumen">
        <p>
          Este sitio no usa cookies de publicidad, análisis ni seguimiento. Quien solo lee la
          revista no recibe ninguna cookie de seguimiento.
        </p>
      </LegalSection>

      <LegalSection title="Lo que sí usamos">
        <ul>
          <li>
            <strong>Cookies de sesión del equipo.</strong> Cuando alguien del equipo inicia sesión
            en el panel, el servicio de cuentas guarda unas cookies para mantener esa sesión. Son
            estrictamente necesarias y solo existen para quienes administran el sitio.
          </li>
          <li>
            <strong>Almacenamiento local de novedades.</strong> La campana de novedades guarda en tu
            dispositivo una lista de lo que ya viste, con el nombre{' '}
            <code>esquirla:notificaciones-vistas</code>. No se envía a ningún servidor y puedes
            borrarla desde los ajustes de tu navegador.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Videos incrustados">
        <p>
          Algunas páginas muestran videos de YouTube, Vimeo o Instagram. Para proteger tu
          privacidad, <strong>el video no se carga hasta que pulsas Reproducir</strong>. Solo
          entonces esos servicios pueden guardar sus propias cookies o recibir datos de tu
          conexión. Para YouTube usamos su modo de privacidad ampliada.
        </p>
        <ul>
          <li>
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacidad de YouTube (Google)</a>
          </li>
          <li>
            <a href="https://vimeo.com/privacy" target="_blank" rel="noreferrer">Privacidad de Vimeo</a>
          </li>
          <li>
            <a href="https://privacycenter.instagram.com/policy" target="_blank" rel="noreferrer">Privacidad de Instagram</a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Cómo borrarlas">
        <p>
          Puedes borrar cookies y almacenamiento local desde los ajustes de privacidad de tu
          navegador. Si algún día añadimos analítica u otra herramienta que use cookies, te
          pediremos tu consentimiento antes y actualizaremos esta página.
        </p>
        <p>
          Más sobre tus datos en la <Link href="/privacidad">política de privacidad</Link>.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}