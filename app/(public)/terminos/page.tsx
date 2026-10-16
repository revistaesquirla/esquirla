import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDoc, LegalSection } from '@/components/public/legal-doc';
import { LEGAL, getContactLine } from '@/lib/legal';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Términos de uso',
  description: 'Reglas para usar el sitio y para enviar contenido a la revista.',
};

export default async function TermsPage() {
  const contacto = await getContactLine();

  return (
    <LegalDoc title="Términos de uso" updated={LEGAL.actualizado}>
      <LegalSection title="1. Aceptación">
        <p>
          Al usar este sitio aceptas estos términos. Si no estás de acuerdo, puedes dejar de usarlo
          en cualquier momento.
        </p>
      </LegalSection>

      <LegalSection title="2. Qué es ESQUIRLA">
        <p>
          ESQUIRLA es una revista escolar sin ánimo de lucro, hecha por estudiantes. El sitio reúne
          sus ediciones, artículos, fragmentos y fechas importantes.
        </p>
      </LegalSection>

      <LegalSection title="3. Contenido y derechos de autor">
        <p>
          Los textos, fotografías e ilustraciones pertenecen a quienes los crearon. Puedes leerlos y
          compartir el enlace, pero no copiarlos ni usarlos en otro lugar sin permiso de su autor.
        </p>
      </LegalSection>

      <LegalSection title="4. Lo que nos envías">
        <p>
          Cuando nos envías un texto, una foto u otra propuesta, nos autorizas a revisarla y, si
          decidimos publicarla, a hacerlo en la revista y en sus redes. Declaras que es tuya o que
          tienes permiso para enviarla.
        </p>
        <p>
          El equipo puede rechazar, ajustar por extensión o claridad, o retirar cualquier contenido.
          Enviar algo no garantiza que se publique.
        </p>
      </LegalSection>

      <LegalSection title="5. Reglas básicas">
        <p>No envíes contenido que:</p>
        <ul>
          <li>ofenda, acose o discrimine a alguien;</li>
          <li>muestre o revele datos personales de otras personas sin su permiso;</li>
          <li>incluya fotos de otras personas, en especial menores, sin autorización;</li>
          <li>sea ilegal o infrinja derechos de terceros;</li>
          <li>suplante a otra persona.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Enlaces cortos y bromas">
        <p>
          La revista puede compartir enlaces con una vista previa humorística o llevar a otra
          dirección como parte de una broma. Esos enlaces nunca piden datos personales ni
          contraseñas. Si algo te parece sospechoso, no pongas datos y avísanos.
        </p>
      </LegalSection>

      <LegalSection title="7. Contenido de terceros">
        <p>
          El sitio enlaza o muestra contenido de otros servicios, como Instagram, YouTube o Vimeo.
          Ese contenido se rige por las reglas de cada servicio. Mira la{' '}
          <Link href="/cookies">política de cookies</Link> para saber cómo se cargan los videos.
        </p>
      </LegalSection>

      <LegalSection title="8. Responsabilidad">
        <p>
          Hacemos lo posible por que el sitio funcione y la información sea correcta, pero se ofrece
          tal cual, sin garantías. Las opiniones de cada artículo son de quien lo firma.
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios y ley aplicable">
        <p>
          Podemos actualizar estos términos; la fecha de arriba indica la última versión. Se rigen
          por las leyes de Colombia. Dudas o reclamos: {contacto}. El tratamiento de datos
          personales se explica en la <Link href="/privacidad">política de privacidad</Link>.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}