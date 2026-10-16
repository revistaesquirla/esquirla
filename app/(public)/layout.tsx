import { SiteHeader } from '@/components/public/site-header';
import { SiteFooter } from '@/components/public/site-footer';
import { LegalLinks } from '@/components/public/legal-links';
import { NotificationBell } from '@/components/public/notification-bell';
import { getNotifications } from '@/lib/notifications';
import { getSettings } from '@/lib/queries';
import { SITE_NAME } from '@/lib/constants';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, notifications] = await Promise.all([
    getSettings().catch(() => null),
    getNotifications(),
  ]);
  const magazineName = settings?.magazine_name ?? SITE_NAME;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        magazineName={magazineName}
        instagram={settings?.instagram ?? null}
        bell={<NotificationBell items={notifications} />}
      />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <SiteFooter
        magazineName={magazineName}
        tagline={settings?.tagline ?? null}
        contactEmail={settings?.contact_email ?? null}
        instagram={settings?.instagram ?? null}
      />
      <LegalLinks />
    </div>
  );
}