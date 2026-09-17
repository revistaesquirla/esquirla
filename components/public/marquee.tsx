export function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y-2 border-carbon bg-rojo py-2 text-paper">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap will-change-transform">
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="font-mono text-[0.72rem] uppercase tracking-[0.2em]"
            aria-hidden={index >= items.length}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
