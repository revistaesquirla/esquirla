'use client';

import { useState } from 'react';

export function CopyButton({ text, label = 'Copiar enlace' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
      } catch {
        // Sin soporte: no hay nada más que hacer.
      }
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="border-2 border-carbon px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] transition-colors hover:bg-carbon hover:text-paper"
    >
      {copied ? 'Copiado ✓' : label}
    </button>
  );
}