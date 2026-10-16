export type NotificationItem = {
  id: string;
  type: 'edition' | 'post' | 'event';
  title: string;
  detail: string | null;
  href: string;
};