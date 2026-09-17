'use client';

import { useActionState } from 'react';
import { updateSettings } from '@/actions/settings';
import { Feedback, Field, SubmitButton } from '@/components/admin/ui';
import type { ActionResult, Settings } from '@/types/database';

export function SettingsForm({ settings }: { settings: Settings | null }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(updateSettings, null);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="marco max-w-2xl space-y-5 p-6">
      {state ? (
        <Feedback tone={state.ok ? 'ok' : 'error'}>
          {state.ok ? (state.message ?? 'Guardado.') : state.error}
        </Feedback>
      ) : null}

      <Field label="Nombre de la revista" htmlFor="magazine_name" errors={fieldErrors?.magazine_name}>
        <input
          id="magazine_name"
          name="magazine_name"
          required
          defaultValue={settings?.magazine_name ?? 'ESQUIRLA'}
          className="campo"
        />
      </Field>

      <Field
        label="Frase de la revista"
        htmlFor="tagline"
        hint="Sale en el pie de página y en los enlaces compartidos."
        errors={fieldErrors?.tagline}
      >
        <input id="tagline" name="tagline" defaultValue={settings?.tagline ?? ''} className="campo" />
      </Field>

      <Field
        label="Correo de contacto"
        htmlFor="contact_email"
        hint="Aparece en Participa para que los estudiantes envíen material."
        errors={fieldErrors?.contact_email}
      >
        <input
          id="contact_email"
          name="contact_email"
          type="email"
          defaultValue={settings?.contact_email ?? ''}
          className="campo"
        />
      </Field>

      <Field label="Instagram u otra red" htmlFor="instagram" errors={fieldErrors?.instagram}>
        <input
          id="instagram"
          name="instagram"
          defaultValue={settings?.instagram ?? ''}
          className="campo"
          placeholder="@esquirla"
        />
      </Field>

      <Field
        label="Texto de la página Sobre"
        htmlFor="about_text"
        hint="Si lo dejas vacío se muestra el texto por defecto de la página."
        errors={fieldErrors?.about_text}
      >
        <textarea
          id="about_text"
          name="about_text"
          rows={8}
          defaultValue={settings?.about_text ?? ''}
          className="campo resize-y"
        />
      </Field>

      <Field
        label="Texto de la página Participa"
        htmlFor="participa_text"
        hint="Si lo dejas vacío se muestran las opciones por defecto."
        errors={fieldErrors?.participa_text}
      >
        <textarea
          id="participa_text"
          name="participa_text"
          rows={8}
          defaultValue={settings?.participa_text ?? ''}
          className="campo resize-y"
        />
      </Field>

      <SubmitButton>Guardar configuración</SubmitButton>
    </form>
  );
}
