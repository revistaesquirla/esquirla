'use client';

import { setEventStatus } from '@/actions/events';
import { StatusToggle } from '@/components/admin/status-toggle';
import type { ContentStatus } from '@/types/database';

export function EventRowActions({ id, status }: { id: string; status: ContentStatus }) {
  return <StatusToggle status={status} onToggle={(next) => setEventStatus(id, next)} />;
}