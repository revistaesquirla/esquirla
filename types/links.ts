export type LinkMode = 'redirect' | 'menu';

export type LinkButton = { label: string; url: string };

export type LinkRow = {
  id: string;
  slug: string;
  label: string;
  mode: LinkMode;
  target_url: string | null;
  page_title: string | null;
  page_message: string | null;
  buttons: LinkButton[] | null;
  og_title: string | null;
  og_description: string | null;
  og_image_path: string | null;
  og_image_url: string | null;
  active: boolean;
  clicks: number;
  created_at: string;
  updated_at: string;
};