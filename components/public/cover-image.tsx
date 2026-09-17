import Image from 'next/image';
import { cn } from '@/lib/utils';

/** Portada con respaldo cuando todavía no se ha subido imagen. */
export function CoverImage({
  src,
  alt,
  priority = false,
  className,
  sizes = '(max-width: 768px) 100vw, 400px',
  fallbackLabel = 'Sin portada',
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  fallbackLabel?: string;
}) {
  return (
    <div className={cn('relative aspect-[3/4] overflow-hidden border-2 border-carbon bg-cemento/30', className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-4 text-center">
          <span className="dato text-carbon/50">{fallbackLabel}</span>
        </div>
      )}
    </div>
  );
}
