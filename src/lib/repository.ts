import type {
  BucketItem,
  BucketStats,
  CategoryId,
  CategoryStat,
  ItemInput,
  ItemPhoto,
  ItemStatus,
  YearStat,
} from './models';
import { supabase } from './supabase';

interface PhotoRow {
  url: string;
  thumb_url: string;
  created_at: string;
}

interface ItemRow {
  id: string;
  title: string;
  note: string | null;
  category: string;
  status: string;
  target_date: string | null;
  completed_at: string | null;
  place_name: string | null;
  cost_target: number | string | null;
  cost_saved: number | string | null;
  rating: number | null;
  is_favorite: boolean | null;
  created_at: string;
  updated_at: string;
  photos?: PhotoRow[] | null;
}

interface PhotoRecord {
  id: string;
  item_id: string;
  url: string;
  thumb_url: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  created_at: string;
}

const ITEM_SELECT = '*, photos(url, thumb_url, created_at)';

function fail(error: { message: string; details?: string | null; hint?: string | null }): never {
  throw new Error(error.message || error.details || 'Supabase-Anfrage fehlgeschlagen');
}

function mapItem(row: ItemRow): BucketItem {
  const photos = [...(row.photos ?? [])].sort((a, b) =>
    a.created_at.localeCompare(b.created_at)
  );
  const cover = photos[0];

  return {
    id: row.id,
    title: row.title,
    note: row.note,
    category: row.category as CategoryId,
    status: row.status as ItemStatus,
    targetDate: row.target_date,
    completedAt: row.completed_at,
    placeName: row.place_name,
    costTarget: row.cost_target === null ? null : Number(row.cost_target),
    costSaved: Number(row.cost_saved ?? 0),
    rating: row.rating === null ? null : Number(row.rating),
    isFavorite: row.is_favorite === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    coverUrl: cover?.url ?? null,
    coverThumbUrl: cover?.thumb_url ?? null,
    photoCount: photos.length,
  };
}

export interface ItemFilter {
  status?: ItemStatus | 'open';
  category?: CategoryId | null;
  search?: string;
}

export async function fetchItems(filter: ItemFilter = {}): Promise<BucketItem[]> {
  let query = supabase
    .from('items')
    .select(ITEM_SELECT)
    .is('deleted_at', null);

  if (filter.status === 'open') {
    query = query.neq('status', 'done');
  } else if (filter.status) {
    query = query.eq('status', filter.status);
  }

  if (filter.category) {
    query = query.eq('category', filter.category);
  }

  const search = filter.search?.trim();
  if (search) {
    const safe = search.replace(/[(),]/g, ' ').slice(0, 80);
    query = query.or(
      `title.ilike.%${safe}%,note.ilike.%${safe}%,place_name.ilike.%${safe}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    fail(error);
  }

  const items = ((data ?? []) as ItemRow[]).map(mapItem);

  if (filter.status === 'done') {
    return items.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
  }

  return items.sort((a, b) => {
    const aDone = a.status === 'done' ? 1 : 0;
    const bDone = b.status === 'done' ? 1 : 0;
    if (aDone !== bDone) {
      return aDone - bDone;
    }
    if (a.isFavorite !== b.isFavorite) {
      return a.isFavorite ? -1 : 1;
    }
    const aDate = a.targetDate ?? '9999-12-31';
    const bDate = b.targetDate ?? '9999-12-31';
    if (aDate !== bDate) {
      return aDate.localeCompare(bDate);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function fetchItem(id: string): Promise<BucketItem | null> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    fail(error);
  }
  return data ? mapItem(data as ItemRow) : null;
}

export async function fetchPhotos(itemId: string): Promise<ItemPhoto[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: true });

  if (error) {
    fail(error);
  }

  return ((data ?? []) as PhotoRecord[]).map((photo) => ({
    id: photo.id,
    itemId: photo.item_id,
    url: photo.url,
    thumbUrl: photo.thumb_url,
    storagePath: photo.storage_path,
    width: photo.width === null ? null : Number(photo.width),
    height: photo.height === null ? null : Number(photo.height),
    createdAt: photo.created_at,
  }));
}

export async function createItem(id: string, input: ItemInput): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase.from('items').insert({
    id,
    title: input.title,
    note: input.note,
    category: input.category,
    status: input.status,
    target_date: input.targetDate,
    completed_at: input.status === 'done' ? now : null,
    place_name: input.placeName,
    cost_target: input.costTarget,
    cost_saved: input.costSaved,
    rating: input.rating,
    is_favorite: input.isFavorite,
    sort_order: 0,
    created_at: now,
    updated_at: now,
  });

  if (error) {
    fail(error);
  }
}

export async function updateItem(id: string, input: ItemInput): Promise<void> {
  const now = new Date().toISOString();
  const current = await supabase
    .from('items')
    .select('completed_at')
    .eq('id', id)
    .single();

  if (current.error) {
    fail(current.error);
  }

  const completedAt =
    input.status === 'done'
      ? (current.data?.completed_at as string | null) ?? now
      : null;

  const { error } = await supabase
    .from('items')
    .update({
      title: input.title,
      note: input.note,
      category: input.category,
      status: input.status,
      target_date: input.targetDate,
      completed_at: completedAt,
      place_name: input.placeName,
      cost_target: input.costTarget,
      cost_saved: input.costSaved,
      rating: input.rating,
      is_favorite: input.isFavorite,
      updated_at: now,
    })
    .eq('id', id);

  if (error) {
    fail(error);
  }
}

export async function setItemStatus(
  id: string,
  status: ItemStatus,
  rating: number | null = null
): Promise<void> {
  const now = new Date().toISOString();
  const update: Record<string, string | number | null> = {
    status,
    completed_at: status === 'done' ? now : null,
    updated_at: now,
  };
  if (rating !== null) {
    update.rating = rating;
  }

  const { error } = await supabase.from('items').update(update).eq('id', id);
  if (error) {
    fail(error);
  }
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('items')
    .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    fail(error);
  }
}

export async function softDeleteItem(id: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('items')
    .update({ deleted_at: now, updated_at: now })
    .eq('id', id);

  if (error) {
    fail(error);
  }
}

export async function addPhoto(photo: ItemPhoto): Promise<void> {
  const { error } = await supabase.from('photos').insert({
    id: photo.id,
    item_id: photo.itemId,
    url: photo.url,
    thumb_url: photo.thumbUrl,
    storage_path: photo.storagePath,
    width: photo.width,
    height: photo.height,
    created_at: photo.createdAt,
  });

  if (error) {
    fail(error);
  }
}

export async function deletePhoto(photoId: string): Promise<void> {
  const { error } = await supabase.from('photos').delete().eq('id', photoId);
  if (error) {
    fail(error);
  }
}

export async function fetchStats(): Promise<BucketStats> {
  const { data, error } = await supabase
    .from('items')
    .select('status, category, completed_at, is_favorite, cost_target')
    .is('deleted_at', null);

  if (error) {
    fail(error);
  }

  const rows = (data ?? []) as Pick<
    ItemRow,
    'status' | 'category' | 'completed_at' | 'is_favorite' | 'cost_target'
  >[];

  const categoryMap = new Map<CategoryId, CategoryStat>();
  const yearMap = new Map<string, YearStat>();
  let done = 0;
  let planned = 0;
  let ideas = 0;
  let favorites = 0;
  let budget = 0;

  for (const row of rows) {
    if (row.status === 'done') {
      done += 1;
      const year = row.completed_at?.slice(0, 4);
      if (year) {
        const entry = yearMap.get(year) ?? { year, done: 0 };
        entry.done += 1;
        yearMap.set(year, entry);
      }
    } else {
      if (row.status === 'planned') {
        planned += 1;
      } else {
        ideas += 1;
      }
      budget += Number(row.cost_target ?? 0);
    }

    if (row.is_favorite) {
      favorites += 1;
    }

    const category = row.category as CategoryId;
    const entry = categoryMap.get(category) ?? { category, total: 0, done: 0 };
    entry.total += 1;
    if (row.status === 'done') {
      entry.done += 1;
    }
    categoryMap.set(category, entry);
  }

  return {
    total: rows.length,
    done,
    planned,
    ideas,
    favorites,
    budget,
    byCategory: Array.from(categoryMap.values()),
    byYear: Array.from(yearMap.values()).sort((a, b) => b.year.localeCompare(a.year)),
  };
}

const DEMO_ITEMS: { input: ItemInput; daysFromNow: number | null }[] = [
  {
    daysFromNow: 120,
    input: {
      title: 'Polarlichter in Island sehen',
      note: 'Am besten zwischen September und März. Fotoausrüstung und Stativ nicht vergessen.',
      category: 'travel',
      status: 'planned',
      targetDate: null,
      placeName: 'Reykjavík, Island',
      costTarget: 1400,
      costSaved: 350,
      rating: null,
      isFavorite: true,
    },
  },
  {
    daysFromNow: null,
    input: {
      title: 'Einen Ramen-Kurs machen',
      note: 'Brühe 12 Stunden ziehen lassen.',
      category: 'food',
      status: 'idea',
      targetDate: null,
      placeName: 'Tokio, Japan',
      costTarget: 120,
      costSaved: 0,
      rating: null,
      isFavorite: false,
    },
  },
  {
    daysFromNow: 30,
    input: {
      title: 'Fallschirmspringen',
      note: 'Tandem ist erlaubt. Danach gibt es ein Video.',
      category: 'adventure',
      status: 'planned',
      targetDate: null,
      placeName: 'Interlaken, Schweiz',
      costTarget: 450,
      costSaved: 150,
      rating: null,
      isFavorite: true,
    },
  },
  {
    daysFromNow: null,
    input: {
      title: 'Gitarre spielen lernen',
      note: 'Ziel: ein Lied komplett spielen können.',
      category: 'learning',
      status: 'done',
      targetDate: null,
      placeName: null,
      costTarget: null,
      costSaved: 0,
      rating: 5,
      isFavorite: false,
    },
  },
  {
    daysFromNow: null,
    input: {
      title: 'Sonnenaufgang auf dem Berg',
      note: 'Früh los, Thermoskanne mitnehmen.',
      category: 'adventure',
      status: 'done',
      targetDate: null,
      placeName: 'Zugspitze',
      costTarget: 60,
      costSaved: 0,
      rating: 4,
      isFavorite: false,
    },
  },
];

/** Adds a handful of sample goals, mainly for the first-run empty state. */
export async function insertDemoItems(newId: () => string): Promise<void> {
  for (const demo of DEMO_ITEMS) {
    const targetDate =
      demo.daysFromNow === null ? null : toIsoDate(addDays(new Date(), demo.daysFromNow));
    await createItem(newId(), { ...demo.input, targetDate });
  }
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}
