import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import type { BucketItem, BucketStats, ItemPhoto } from '@/lib/models';
import {
  fetchItem,
  fetchItems,
  fetchPhotos,
  fetchStats,
  type ItemFilter,
} from '@/lib/repository';

export function useItems(filter: ItemFilter) {
  const { status, category, search } = filter;
  const [items, setItems] = useState<BucketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const next = await fetchItems({ status, category, search });
      setItems(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unbekannter Datenbankfehler');
    } finally {
      setLoading(false);
    }
  }, [status, category, search]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return { items, loading, error, reload: load, setItems };
}

export function useItem(id: string | undefined) {
  const [item, setItem] = useState<BucketItem | null>(null);
  const [photos, setPhotos] = useState<ItemPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('Eintrag nicht gefunden');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const [nextItem, nextPhotos] = await Promise.all([fetchItem(id), fetchPhotos(id)]);
      setItem(nextItem);
      setPhotos(nextPhotos);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unbekannter Datenbankfehler');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return { item, photos, loading, error, reload: load };
}

export function useStats() {
  const [stats, setStats] = useState<BucketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setStats(await fetchStats());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unbekannter Datenbankfehler');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return { stats, loading, error, reload: load };
}
