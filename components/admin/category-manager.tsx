'use client';

import { useActionState } from 'react';
import { createCategory, deleteCategory } from '@/actions/categories';
import { ConfirmAction } from '@/components/admin/confirm-action';
import { Feedback, SubmitButton } from '@/components/admin/ui';
import type { ActionResult, Category } from '@/types/database';

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(createCategory, null);

  return (
    <div className="marco max-w-2xl p-6">
      <h2 className="titular text-2xl">Categorías</h2>
      <p className="mt-2 text-sm text-carbon/70">
        Las secciones que puedes asignar a cada post. Crea las que necesites.
      </p>

      <form action={formAction} className="mt-5 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="name" className="etiqueta">
            Nueva categoría
          </label>
          <input id="name" name="name" required className="campo" placeholder="DEPORTE" />
        </div>
        <SubmitButton pendingLabel="Creando…">Crear</SubmitButton>
      </form>

      {state ? (
        <div className="mt-4">
          <Feedback tone={state.ok ? 'ok' : 'error'}>
            {state.ok ? (state.message ?? 'Creada.') : state.error}
          </Feedback>
        </div>
      ) : null}

      <ul className="mt-6 divide-y divide-carbon/15 border-t-2 border-carbon">
        {categories.map((category) => (
          <li key={category.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-bold uppercase">{category.name}</p>
              <p className="dato text-carbon/45">/posts?categoria={category.slug}</p>
            </div>
            <ConfirmAction
              action={() => deleteCategory(category.id)}
              label="Eliminar"
              question={`¿Eliminar "${category.name}"? Los posts que la usan quedarán sin categoría, pero no se borran.`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
