'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { signIn } from '@/actions/auth';
import { Feedback, SubmitButton } from '@/components/admin/ui';
import type { ActionResult } from '@/types/database';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/admin';
  const [state, formAction] = useActionState<ActionResult | null, FormData>(signIn, null);

  return (
    <main className="grid min-h-dvh place-items-center bg-carbon px-5 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="wordmark block text-5xl text-paper">
          Esquirla
        </Link>
        <p className="dato mt-2 text-paper/45">Panel de administración</p>

        <form action={formAction} className="mt-8 space-y-4 border-2 border-paper bg-paper p-6">
          <input type="hidden" name="next" value={next} />

          {state && !state.ok ? <Feedback tone="error">{state.error}</Feedback> : null}

          <div>
            <label htmlFor="email" className="etiqueta">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="campo"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="etiqueta">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="campo"
            />
          </div>

          <SubmitButton pendingLabel="Entrando…" className="w-full">
            Entrar
          </SubmitButton>
        </form>

        <p className="mt-6 text-center font-mono text-[0.68rem] uppercase tracking-[0.14em] text-paper/40">
          <Link href="/" className="hover:text-rojo">
            Volver al sitio
          </Link>
        </p>
      </div>
    </main>
  );
}
