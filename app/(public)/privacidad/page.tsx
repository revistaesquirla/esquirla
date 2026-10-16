import type { Metadata } from 'next';
import { LegalDoc, LegalSection } from '@/components/public/legal-doc';
import { COLEGIO } from '@/lib/credits';
import { LEGAL, getContactLine } from '@/lib/legal';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Qué datos recoge la revista, para qué los usa y cómo ejercer tus derechos.',
};

export default async function PrivacyPage() {
  const contacto = await getContactLine();

  return (
    <LegalDoc title="Política de privacidad" updated={LEGAL.actualizado}>
      <LegalSection title="1. Quién trata tus datos">
        <p>
          {LEGAL.responsable}, vinculada a {COLEGIO.nombre}, es la responsable del tratamiento de
          los datos personales que se recogen en este sitio.
        </p>
        <p>Para cualquier consulta o solicitud sobre tus datos escribe a: {contacto}.</p>
      </LegalSection>

      <LegalSection title="2. Qué datos recogemos y para qué">
        <ul>
          <li>
            <strong>Formulario Participa:</strong> tu nombre, un medio de contacto (correo o
            Instagram), el tema y tu mensaje. Los usamos para valorar tu propuesta y responderte. No
            se publican.
          </li>
          <li>
            <strong>Fragmentos:</strong> el texto que escribes y, si quieres, tu nombre. Si el
            equipo lo aprueba, se publica con ese nombre, o como Anónimo si lo dejaste vacío.
          </li>
          <li>
            <strong>Equipo de la revista:</strong> correo y contraseña de quienes administran el
            sitio, solo para iniciar sesión.
          </li>
          <li>
            <strong>Datos técnicos:</strong> como en casi cualquier sitio, los proveedores de
            alojamiento pueden registrar datos de la conexión (por ejemplo, la dirección IP) por
            seguridad y funcionamiento. No los usamos para perfilarte.
          </li>
          <li>
            <strong>Enlaces cortos:</strong> solo contamos cuántas veces se abre cada enlace. No
            guardamos quién lo abrió.
          </li>
        </ul>
        <p>No usamos publicidad ni herramientas de análisis o seguimiento.</p>
      </LegalSection>

      <LegalSection title="3. Tu autorización">
        <p>
          Antes de enviar un formulario te pedimos marcar una casilla de aceptación. Esa casilla es
          tu autorización previa, expresa e informada para tratar tus datos como se explica aquí.
          Puedes revocarla cuando quieras escribiendo al contacto indicado arriba.
        </p>
      </LegalSection>

      <LegalSection title="4. Menores de edad">
        <p>
          ESQUIRLA la hacen y la leen estudiantes, y muchos son menores de 18 años. Si eres menor de
          edad, pide permiso a tu madre, padre o acudiente antes de enviar tus datos o cualquier
          fotografía. El equipo puede pedir esa autorización antes de publicar algo.
        </p>
        <p>
          Nunca publicamos datos de contacto de nadie, y no publicamos datos personales de menores
          sin autorización de su representante.
        </p>
      </LegalSection>

      <LegalSection title="5. Con quién se comparten">
        <p>
          No vendemos ni cedemos tus datos. Para que el sitio funcione usamos proveedores que los
          procesan por nuestra cuenta y que operan fuera de Colombia:
        </p>
        <ul>
          <li>
            <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer">Supabase</a>:
            base de datos y cuentas del equipo.
          </li>
          <li>
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel</a>:
            alojamiento del sitio.
          </li>
          <li>
            <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer">Cloudflare</a>:
            archivos PDF de las ediciones.
          </li>
        </ul>
        <p>
          Al aceptar, autorizas este tratamiento por parte de esos proveedores, incluida la
          transferencia internacional necesaria para prestar el servicio.
        </p>
      </LegalSection>

      <LegalSection title="6. Cuánto tiempo los guardamos">
        <p>
          Las propuestas y los mensajes se conservan mientras se valoran y, como máximo, un año.
          Los fragmentos publicados siguen visibles hasta que pidas retirarlos. Puedes pedir que
          borremos tus datos antes.
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos">
        <p>
          Conforme a la Ley 1581 de 2012 y sus normas reglamentarias (Decreto 1074 de 2015), tienes
          derecho a:
        </p>
        <ul>
          <li>conocer, actualizar y rectificar tus datos;</li>
          <li>pedir prueba de la autorización que diste;</li>
          <li>ser informado del uso que se ha dado a tus datos;</li>
          <li>revocar la autorización y pedir que se supriman tus datos;</li>
          <li>acceder gratuitamente a tus datos;</li>
          <li>
            presentar quejas ante la Superintendencia de Industria y Comercio
            (<a href="https://www.sic.gov.co" target="_blank" rel="noreferrer">sic.gov.co</a>).
          </li>
        </ul>
        <p>Para ejercerlos escribe a {contacto} indicando qué quieres hacer.</p>
      </LegalSection>

      <LegalSection title="8. Seguridad">
        <p>
          Usamos conexiones cifradas (HTTPS), las solicitudes solo las ve el equipo autorizado y el
          panel está protegido con cuenta y permisos. Ningún sistema es infalible, pero cuidamos tus
          datos.
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios">
        <p>Si esta política cambia, actualizaremos la fecha que aparece arriba.</p>
      </LegalSection>
    </LegalDoc>
  );
}