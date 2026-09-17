import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { getAdminSession } from '@/lib/supabase/guards';

// El panel nunca se cachea: siempre refleja el estado real de la base.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Panel',
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // Segunda barrera, después del middleware: aquí además se comprueba el rol.
  if (!session) redirect('/admin/login');

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
