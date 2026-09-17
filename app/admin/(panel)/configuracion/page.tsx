import { CategoryManager } from '@/components/admin/category-manager';
import { SettingsForm } from '@/components/admin/settings-form';
import { PageHeading } from '@/components/admin/ui';
import { getCategories, getSettings } from '@/lib/queries';

export default async function AdminSettingsPage() {
  const [settings, categories] = await Promise.all([
    getSettings().catch(() => null),
    getCategories().catch(() => []),
  ]);

  return (
    <>
      <PageHeading
        title="Configuración"
        description="Nombre, textos y categorías de la revista. Se aplican a todo el sitio."
      />

      <div className="space-y-10">
        <SettingsForm settings={settings} />
        <CategoryManager categories={categories} />
      </div>
    </>
  );
}
