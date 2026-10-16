export function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <header className="border-b-2 border-carbon pb-8">
        <h1 className="titular text-[clamp(2.4rem,9vw,5rem)]">{title}</h1>
        <p className="dato mt-4 text-carbon/50">Última actualización: {updated}</p>
      </header>
      <div className="mt-10 space-y-10">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="titular text-2xl">{title}</h2>
      <div className="prosa mt-4">{children}</div>
    </section>
  );
}