import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/utils';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(`${siteUrl()}/admin/login`, { status: 303 });
}
