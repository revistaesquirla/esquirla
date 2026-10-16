'use client';

import Link from 'next/link';
import { startTransition, useActionState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { submitFragment, submitParticipa } from '@/actions/submissions';
import type { ActionResult } from '@/types/database';

const TOPICS = ['Fotografías', 'Una historia', 'Ilustraciones', 'Música', 'Una entrevista', 'Ayudar con una edición', 'Otro'];

function Send({ label, pending }: { label: string; pending: boolean }) {
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className="boton">
      {pending ? 'Enviando…' : label}
    </button>
  );
}

function Notice({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p
      role={state.ok ? 'status' : 'alert'}
      className={`border-2 px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] ${
        state.ok ? 'border-carbon bg-carbon text-paper' : 'border-rojo-oscuro text-rojo-oscuro'
      }`}
    >
      {state.ok ? (state.message ?? 'Enviado.') : state.error}
    </p>
  );
}

function Err({ state, name }: { state: ActionResult | null; name: string }) {
  const message = state && !state.ok ? state.fieldErrors?.[name]?.[0] : null;
  return message ? <p className="mt-1 text-xs font-bold text-rojo-oscuro">{message}</p> : null;
}

/** Campo trampa para bots: invisible para las personas. */
function Honeypot() {
  return (
    <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
      <label htmlFor="website">No llenes este campo</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

function MinorsNote() {
  return (
    <p className="text-xs leading-relaxed text-carbon/60">
      Si eres menor de 18 años, pide permiso a tu madre, padre o acudiente antes de enviar.
    </p>
  );
}

function PrivacyLink() {
  return (
    <>
      {' '}
      <Link href="/privacidad" target="_blank" className="underline decoration-rojo underline-offset-2">
        Política de privacidad
      </Link>
      .
    </>
  );
}

/**
 * Envía el formulario a mano. Si usáramos action={...}, React 19 borraría
 * todo lo escrito cuando el servidor responde con un error de validación.
 */
function useManualSubmit(dispatch: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };
}

export function FragmentForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(submitFragment, null);
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = useManualSubmit(action);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative space-y-4">
      <Notice state={state} />
      <Honeypot />

      <div>
        <label htmlFor="frag-body" className="etiqueta">Tu fragmento</label>
        <textarea
          id="frag-body"
          name="body"
          rows={4}
          maxLength={400}
          required
          className="campo resize-y"
          placeholder="Una frase, un recuerdo, algo que quieras que se lea."
        />
        <Err state={state} name="body" />
      </div>

      <div>
        <label htmlFor="frag-name" className="etiqueta">Nombre (opcional)</label>
        <input id="frag-name" name="name" maxLength={80} className="campo" placeholder="Déjalo vacío para salir como Anónimo" />
      </div>

      <MinorsNote />

      <div>
        <label className="flex items-start gap-3 border-2 border-carbon p-3">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[#E02118]" />
          <span className="text-xs leading-relaxed text-carbon/75">
            Acepto que mi mensaje se publique en la revista si el equipo lo aprueba, con el nombre
            que escribí (o como Anónimo si lo dejé vacío), y autorizo el tratamiento de mis datos.
            <PrivacyLink />
          </span>
        </label>
        <Err state={state} name="consent" />
      </div>

      <Send label="Enviar fragmento" pending={pending} />
    </form>
  );
}

export function ParticipaForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(submitParticipa, null);
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = useManualSubmit(action);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="relative space-y-4">
      <Notice state={state} />
      <Honeypot />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="par-name" className="etiqueta">Nombre</label>
          <input id="par-name" name="name" required maxLength={80} className="campo" />
          <Err state={state} name="name" />
        </div>
        <div>
          <label htmlFor="par-contact" className="etiqueta">Correo o Instagram</label>
          <input id="par-contact" name="contact" required maxLength={160} className="campo" placeholder="Para poder responderte" />
          <Err state={state} name="contact" />
        </div>
      </div>

      <div>
        <label htmlFor="par-topic" className="etiqueta">¿Qué quieres aportar?</label>
        <select id="par-topic" name="topic" required defaultValue="" className="campo">
          <option value="" disabled>Elige una opción</option>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
        <Err state={state} name="topic" />
      </div>

      <div>
        <label htmlFor="par-body" className="etiqueta">Cuéntanos</label>
        <textarea id="par-body" name="body" rows={6} maxLength={2000} required className="campo resize-y" />
        <Err state={state} name="body" />
      </div>

      <MinorsNote />

      <div>
        <label className="flex items-start gap-3 border-2 border-carbon p-3">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-[#E02118]" />
          <span className="text-xs leading-relaxed text-carbon/75">
            Autorizo que el equipo de la revista use estos datos solo para responderme y valorar mi
            propuesta. No se publican.
            <PrivacyLink />
          </span>
        </label>
        <Err state={state} name="consent" />
      </div>

      <Send label="Enviar propuesta" pending={pending} />
    </form>
  );
}