import type { ContentStatus } from '@/types/database';

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
};