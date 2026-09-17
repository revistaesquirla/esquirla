'use client';

import { setPostStatus } from '@/actions/posts';
import { StatusToggle } from '@/components/admin/status-toggle';
import type { ContentStatus } from '@/types/database';

export function PostRowActions({ id, status }: { id: string; status: ContentStatus }) {
  return <StatusToggle status={status} onToggle={(next) => setPostStatus(id, next)} />;
}
