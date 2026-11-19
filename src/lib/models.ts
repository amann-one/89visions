export const CATEGORIES = [
  { id: 'travel', label: 'Reisen', emoji: '✈️' },
  { id: 'adventure', label: 'Abenteuer', emoji: '🎢' },
  { id: 'food', label: 'Genuss', emoji: '🍜' },
  { id: 'learning', label: 'Lernen', emoji: '🎓' },
  { id: 'people', label: 'Menschen', emoji: '❤️' },
  { id: 'other', label: 'Sonstiges', emoji: '✨' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export const STATUSES = [
  { id: 'idea', label: 'Idee' },
  { id: 'planned', label: 'Geplant' },
  { id: 'done', label: 'Erledigt' },
] as const;

export type ItemStatus = (typeof STATUSES)[number]['id'];

export interface BucketItem {
  id: string;
  title: string;
  note: string | null;
  category: CategoryId;
  status: ItemStatus;
  targetDate: string | null;
  completedAt: string | null;
  placeName: string | null;
  costTarget: number | null;
  costSaved: number;
  rating: number | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  coverUrl: string | null;
  coverThumbUrl: string | null;
  photoCount: number;
}

export interface ItemPhoto {
  id: string;
  itemId: string;
  url: string;
  thumbUrl: string;
  storagePath: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface ItemInput {
  title: string;
  note: string | null;
  category: CategoryId;
  status: ItemStatus;
  targetDate: string | null;
  placeName: string | null;
  costTarget: number | null;
  costSaved: number;
  rating: number | null;
  isFavorite: boolean;
}

export interface CategoryStat {
  category: CategoryId;
  total: number;
  done: number;
}

export interface YearStat {
  year: string;
  done: number;
}

export interface BucketStats {
  total: number;
  done: number;
  planned: number;
  ideas: number;
  favorites: number;
  budget: number;
  byCategory: CategoryStat[];
  byYear: YearStat[];
}

export function getCategory(id: string): (typeof CATEGORIES)[number] {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getStatus(id: string): (typeof STATUSES)[number] {
  return STATUSES.find((status) => status.id === id) ?? STATUSES[0];
}
