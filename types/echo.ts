export interface ChapterMeta {
  id: string;
  label: string;
}

export interface NavLinkMeta {
  id: string;
  label: string;
  cursor: string;
}

export interface CircuitRoute {
  inIdx: number;
  outIdx: number;
  inTag: string;
  inTitle: string;
  inSub: string;
  outTag: string;
  outTitle: string;
  outSub: string;
  routeLabel: string;
  title: string;
  desc: string;
  hops: [string, string, string];
}

export interface MarketplaceListing {
  id: string;
  slot: string;
  title: string;
  peer: string;
  meta: string;
  hall: string;
  category: 'Engineering' | 'Design' | 'Quantitative' | 'Studio';
  hours: number;
  rating: number;
  sessions: number;
  status: 'OPEN' | 'BOARDING' | 'LAST SEAT';
  summary: string;
  deliverables: string[];
}

export interface StressMetric {
  k: string;
  v: string;
  s: string;
}

export interface StressScenario {
  switchTag: string;
  switchTitle: string;
  switchDesc: string;
  title: string;
  pill: string;
  chartLabel: string;
  chartMetric: string;
  limitY: number;
  limitText: string;
  curve: string;
  dot: { cx: number; cy: number };
  logs: string[];
  metrics: StressMetric[];
}

export interface PassPreset {
  label: string;
  name: string;
  uni: string;
  craft: string;
}

export interface EscrowReceipt {
  summary: string;
  hash: string;
  time: string;
}

export interface ToastItem {
  id: number;
  message: string;
}

export type CategoryFilter = 'All' | 'Engineering' | 'Design' | 'Quantitative' | 'Studio';
export type SortMode = 'rating' | 'hours-asc' | 'hours-desc';
export type ChromeTheme = 'dark' | 'light';
