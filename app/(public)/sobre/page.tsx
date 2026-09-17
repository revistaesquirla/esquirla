import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings } from '@/lib/queries';
import {
  COLEGIO,
  CREDITOS_EQUIPO,
  CREDITOS_PROFESORAS,
  GRUPO_CREADOR,
  instagramUrl,
} from '@/lib/credits';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Sobre Esquirla',
  description: 'Qué es Esquirla, de dónde sale el nombre y quién la hace.',
};

export default async function AboutPage() {
  const settings = await getSettings().catch(() => null);
  const name = settings?.magazine_name ?? 'ESQUIRLA';
  const customText = settings?.about_text;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <header className="border-b-2 border-carbon pb-8">
        <h1 className="titular text-[clamp(2.8rem,10vw,6rem)]">Sobre {name}</h1>
      </header>

      {customText ? (
        <div className="prosa mt-10 whitespace-pre-line">{customText}</div>
      ) : (
        <div className="mt-10 space-y-12">
          <Block title="Qué es">
            <p>
              {name} es la revista del colegio. La escriben, fotografían, diseñan y arman
              estudiantes. Sale por ediciones: cada una se puede leer completa aquí mismo, y entre
              edición y edición publicamos posts sueltos.
            </p>
          </Block>

          <Block title="El nombre">
            <p>
              Una esquirla es el pedazo que salta cuando algo se rompe. Pequeño, con filo, difícil
              de ignorar. Eso queremos ser: los pedazos del colegio que no caben en una cartelera ni
              en una circular.
            </p>
          </Block>

          <Block title="Quién la hace">
            <p>
              Un equipo abierto de estudiantes. Nadie tiene que ser periodista ni diseñador para
              entrar: si te interesa escribir, tomar fotos, ilustrar o proponer temas, ya cumples el
              requisito. El equipo cambia con cada edición y esa es la idea.
            </p>
          </Block>

          <Block title="Para quién">
            <p>
              Para quien estudia aquí. También para quien ya salió y quiere ver qué está pasando, y
              para las familias que solo conocen el colegio por lo que se cuenta en casa.
            </p>
          </Block>

          <Block title="Qué queremos contar">
            <p>
              Lo que de verdad ocurre: lo que pasa en el escenario y lo que pasa en el pasillo. Las
              presentaciones, los ensayos que salieron mal, la música que todo el mundo está
              oyendo, las personas que uno ve todos los días sin saber nada de ellas.
            </p>
          </Block>
        </div>
      )}

      <div className="mt-12">
        <Block title="Créditos">
          <div className="space-y-6">
            <div>
              <p className="dato text-cemento">{GRUPO_CREADOR.nombre}</p>
              <ul className="mt-2 space-y-1">
                {CREDITOS_EQUIPO.map((persona) => (
                  <li key={persona.instagram}>
                    {persona.nombre}{' '}
                    <a
                      href={instagramUrl(persona.instagram)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-rojo hover:underline"
                    >
                      {persona.instagram}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="dato text-cemento">Profesoras encargadas</p>
              <ul className="mt-2 space-y-1">
                {CREDITOS_PROFESORAS.map((nombre) => (
                  <li key={nombre}>{nombre}</li>
                ))}
              </ul>
            </div>
          </div>
        </Block>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <a
          href={COLEGIO.url}
          target="_blank"
          rel="noreferrer"
          className="marco flex items-center gap-5 p-6 transition-colors hover:border-rojo"
        >
          <img
            src="/logos/colegio.svg"
            alt={`Logo de ${COLEGIO.nombre}`}
            width={64}
            height={64}
            className="h-14 w-14 shrink-0"
          />
          <div>
            <p className="dato text-cemento">Colegio</p>
            <p className="titular text-xl leading-tight">{COLEGIO.nombre}</p>
            <span className="mt-1 inline-block font-mono text-xs uppercase tracking-[0.14em] text-rojo">
              coltec.edu.co
            </span>
          </div>
        </a>

        <div className="marco flex items-center gap-5 p-6">
          <img
            src="/logos/mamarre-legacy.svg"
            alt={`Logo de ${GRUPO_CREADOR.nombre}`}
            width={64}
            height={64}
            className="h-14 w-14 shrink-0"
          />
          <div>
            <p className="dato text-cemento">Un proyecto de</p>
            <p className="titular text-xl leading-tight">{GRUPO_CREADOR.nombre}</p>
          </div>
        </div>
      </div>

      <div className="mt-16 border-2 border-carbon bg-carbon p-8 text-paper">
        <p className="titular text-3xl">¿Quieres salir en la próxima?</p>
        <p className="mt-3 max-w-md text-paper/75">
          La revista se arma con lo que manden los estudiantes. Mira cómo participar.
        </p>
        <Link
          href="/participa"
          className="mt-6 inline-flex border-2 border-paper bg-paper px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-carbon transition-colors hover:bg-rojo hover:text-paper"
        >
          Participar
        </Link>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 sm:grid-cols-[130px_1fr] sm:gap-8">
      <h2 className="dato pt-1 text-rojo">{title}</h2>
      <div className="text-lg leading-relaxed text-carbon/85">{children}</div>
    </section>
  );
}
