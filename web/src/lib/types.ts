// Shared API response types — mirror src/modules/* services (backend is truth).

export interface Edition {
  id: string;
  idx: number;
  album: string;
  artist: string;
  date: string;
  venue: string;
  price: number;
  capacity: number;
  spots_sold: number;
  spotsLeft: number;
  status: string;
  attendance: number | null;
  tix_africa_url: string | null;
  tix_africa_event_id: string | null;
  name: string;
  kind: string;
  meta: Record<string, unknown> | null;
}

export interface Paged<T> {
  editions: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type EditionsPage = Paged<Edition>;

export interface SongComment {
  id: string;
  song_id: string;
  who: string;
  text: string;
  created_at: string;
}

export interface Song {
  id: string;
  week_number: number;
  title: string;
  artist: string;
  picked_by: string;
  note: string;
  is_current: boolean;
  reaction_repeat: number;
  reaction_needed: number;
  reaction_skip: number;
  youtube_url: string | null;
  comments: SongComment[];
  // Home / now-spinning shape may carry link instead of youtube_url
  link?: string | null;
}

export interface BoardEntry {
  id: string;
  name: string;
  track: string;
  why: string;
  link?: string | null;
  upvotes: number;
  downvotes: number;
  score: number;
  status: string;
}

export interface MerchItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number | null;
  sold: number;
  remaining: number | null;
  status: string;
  note: string;
  size_options: string[] | null;
  monnify_base_url: string | null;
  is_published: boolean;
}

export interface MerchOrder {
  id: string;
  items: unknown;
  total: number;
  status: string;
  monnify_link: string | null;
  created_at: string;
}

export interface UpdateItem {
  id: string;
  date: string;
  title: string;
  description: string;
  source: string;
  source_url: string | null;
  meta: Record<string, unknown> | null;
}

export interface HomeData {
  nowSpinning: {
    id: string;
    week_number: number;
    title: string;
    artist: string;
    picked_by: string;
    note: string;
    youtube_url?: string | null;
    link?: string | null;
  } | null;
  nextEdition: Edition | null;
  latestUpdate: { id: string; date: string; title: string; description: string } | null;
}

export interface CartLine {
  sku: string;
  qty: number;
  size?: string;
}
