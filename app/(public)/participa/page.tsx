import type { Metadata } from 'next';
import { getSettings } from '@/lib/queries';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Participa',
  description: 'Cómo enviar fotos, historias, ilustraciones o música a la revista.',
};

const WAYS = [
  {
    title: 'Manda fotos',
    text: 'De un ensayo, de un partido, del salón a las 6:40 de la mañana. Sin retoque ni pose.',
  },
  {
    title: 'Propón una historia',
    text: 'Algo que pasó y que crees que merece contarse bien. No hace falta que la escribas tú.',
  },
  {
    title: 'Envía ilustraciones',
    text: 'Dibujo, collage, tipografía, lo que estés haciendo en tu cuaderno.',
  },
  {
    title: 'Recomienda música',
    text: 'Para la sección RUIDO. Una canción y dos líneas explicando por qué.',
  },
  {
    title: 'Deja que te entrevistemos',
    text: 'O propón a alguien del colegio que te parezca que vale la pena escuchar.',
  },
  {
    title: 'Arma la próxima edición',
    text: 'Edición, diseño, corrección, fotografía. Se aprende haciéndolo.',
  },
];

export default async function ParticipaPage() {
  const settings = await getSettings().catch(() => null);
  const customText = settings?.participa_text;
  const email = settings?.contact_email;

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
      <header className="border-b-2 border-carbon pb-8">
        <h1 className="titular text-[clamp(2.8rem,10vw,6rem)]">Participa</h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-carbon/80">
          La revista no la hace un grupo cerrado. Cada edición se arma con lo que llega. Si tienes
          algo, esto es lo que puedes mandar.
        </p>
      </header>

      {customText ? (
        <div className="prosa mt-10 whitespace-pre-line">{customText}</div>
      ) : (
        <ul className="mt-10 grid gap-px border-2 border-carbon bg-carbon sm:grid-cols-2">
          {WAYS.map((way) => (
            <li key={way.title} className="bg-paper p-6">
              <h2 className="titular text-xl">{way.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-carbon/75">{way.text}</p>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12 border-2 border-carbon p-8">
        <h2 className="titular text-3xl">Cómo enviarlo</h2>
        {email ? (
          <>
            <p className="mt-3 text-carbon/80">Escribe a este correo y cuéntanos qué tienes.</p>
            <a href={`mailto:${email}`} className="boton mt-6">
              {email}
            </a>
          </>
        ) : (
          <p className="mt-3 max-w-lg text-carbon/80">
            Todavía no hay un correo publicado. Un administrador puede agregarlo desde el panel, en
            Configuración, y aparecerá aquí.
          </p>
        )}
        <p className="dato mt-8 text-carbon/45">
          Próximamente: formulario para enviar archivos directamente desde esta página.
        </p>
      </section>
    </div>
  );
}
