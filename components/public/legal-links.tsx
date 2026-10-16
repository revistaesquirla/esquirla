import Link from 'next/link';

const LINKS = [
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/terminos', label: 'Términos' },
  { href: '/cookies', label: 'Cookies' },
];

export function LegalLinks() {
  return (
    <div className="border-t border-paper/15 bg-carbon text-paper">
      <nav aria-label="Legal" className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 px-5 py-4">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-paper/50 hover:text-rojo"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}