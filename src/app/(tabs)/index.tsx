import { randomUUID } from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
  Alert,
} from 'react-native';

import { CategoryChips } from '@/components/bucket/category-chips';
import { EmptyState } from '@/components/bucket/empty-state';
import { InlineError } from '@/components/bucket/inline-error';
import { ItemCard } from '@/components/bucket/item-card';
import { ProgressBar } from '@/components/bucket/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useItems } from '@/hooks/use-bucket-data';
import { useTheme } from '@/hooks/use-theme';
import type { CategoryId } from '@/lib/models';
import { insertDemoItems, setItemStatus } from '@/lib/repository';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function BucketListScreen() {
  const theme = useTheme();
  const { items, loading, error, reload } = useItems({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const doneCount = items.filter((item) => item.status === 'done').length;
  const openCount = items.length - doneCount;

  const visibleItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      if (category && item.category !== category) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return [item.title, item.note, item.placeName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(needle));
    });
  }, [items, category, search]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const toggleDone = useCallback(
    async (id: string, isDone: boolean) => {
      try {
        await setItemStatus(id, isDone ? 'planned' : 'done');
        void Haptics.notificationAsync(
          isDone ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success
        );
        await reload();
      } catch (cause) {
        Alert.alert('Fehler', cause instanceof Error ? cause.message : 'Status konnte nicht geändert werden.');
      }
    },
    [reload]
  );

  const surpriseMe = useCallback(() => {
    const open = items.filter((item) => item.status !== 'done');
    if (open.length === 0) {
      Alert.alert('Alles erledigt', 'Lege zuerst ein neues Ziel an.');
      return;
    }
    const pick = open[Math.floor(Math.random() * open.length)];
    void Haptics.selectionAsync();
    router.push({ pathname: '/item/[id]', params: { id: pick.id } });
  }, [items]);

  const seedDemo = useCallback(async () => {
    setSeeding(true);
    try {
      await insertDemoItems(() => randomUUID());
      await reload();
    } catch (cause) {
      Alert.alert('Fehler', cause instanceof Error ? cause.message : 'Beispiele konnten nicht geladen werden.');
    } finally {
      setSeeding(false);
    }
  }, [reload]);

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <ThemedText style={[styles.eyebrow, { color: theme.textSecondary }]}>
            {openCount > 0 ? `${openCount} OFFENE ZIELE` : 'DEINE LISTE'}
          </ThemedText>
          <ThemedText style={styles.heading}>Bucket List</ThemedText>
        </View>
        <Pressable
          onPress={surpriseMe}
          accessibilityRole="button"
          accessibilityLabel="Zufälliges Ziel öffnen"
          style={({ pressed }) => [
            styles.surpriseButton,
            {
              backgroundColor: theme.backgroundElement,
              borderColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          <ThemedText style={styles.surpriseIcon}>🎲</ThemedText>
        </Pressable>
      </View>

      <View style={[styles.progressCard, { backgroundColor: theme.accent }]}>
        <View style={styles.progressTopRow}>
          <ThemedText style={[styles.progressBig, { color: theme.accentContrast }]}>
            {doneCount}
            <ThemedText style={[styles.progressSmall, { color: theme.accentContrast }]}>
              {' '}
              von {items.length} erlebt
            </ThemedText>
          </ThemedText>
          <ThemedText style={[styles.progressPercent, { color: theme.accentContrast }]}>
            {items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0}%
          </ThemedText>
        </View>
        <View style={styles.progressTrack}>
          <ProgressBar
            value={items.length > 0 ? doneCount / items.length : 0}
            height={7}
            trackColor="rgba(255,255,255,0.28)"
            color={theme.accentContrast}
          />
        </View>
        <ThemedText style={[styles.progressHint, { color: theme.accentContrast }]}>
          {isSupabaseConfigured
            ? 'Mit Supabase synchronisiert'
            : 'Supabase nicht konfiguriert'}
        </ThemedText>
      </View>

      <View
        style={[
          styles.searchBox,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <ThemedText style={{ color: theme.textSecondary }}>🔍</ThemedText>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Ziele durchsuchen"
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.text }]}
          returnKeyType="search"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={10}>
            <ThemedText style={{ color: theme.textSecondary }}>✕</ThemedText>
          </Pressable>
        )}
      </View>

      <CategoryChips value={category} onChange={setCategory} />
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.textSecondary}
          />
        }
        ListHeaderComponent={
          <>
            {header}
            {error && (
              <View style={styles.errorWrap}>
                <InlineError message={error} onRetry={() => void reload()} />
              </View>
            )}
          </>
        }
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
            onToggleDone={() => void toggleDone(item.id, item.status === 'done')}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.accent} />
            </View>
          ) : items.length === 0 ? (
            <EmptyState
              emoji="🌍"
              title="Deine Liste ist noch leer"
              message="Sammle alles, was du sehen, tun und erleben willst. Ein Ziel reicht für den Anfang."
              actionLabel="Erstes Ziel anlegen"
              onAction={() => router.push('/edit')}
              secondaryLabel={seeding ? 'Beispiele werden geladen…' : 'Beispiele laden'}
              onSecondary={() => void seedDemo()}
            />
          ) : (
            <EmptyState
              emoji="🔎"
              title="Nichts gefunden"
              message="Für diese Suche oder Kategorie gibt es noch keinen Eintrag."
              actionLabel="Filter zurücksetzen"
              onAction={() => {
                setSearch('');
                setCategory(null);
              }}
            />
          )
        }
      />

      <Pressable
        onPress={() => router.push('/edit')}
        accessibilityRole="button"
        accessibilityLabel="Neues Ziel anlegen"
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.accent,
            opacity: pressed ? 0.85 : 1,
            shadowColor: theme.text,
          },
        ]}>
        <ThemedText style={[styles.fabIcon, { color: theme.accentContrast }]}>＋</ThemedText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: BottomTabInset + 100,
  },
  header: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    marginHorizontal: -20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  titleBlock: {
    gap: 2,
    flex: 1,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  heading: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  surpriseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surpriseIcon: {
    fontSize: 20,
    lineHeight: 26,
  },
  progressCard: {
    marginHorizontal: 20,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    gap: 10,
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  progressBig: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  progressSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    opacity: 0.85,
  },
  progressTrack: {
    opacity: 0.95,
  },
  progressHint: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  errorWrap: {
    marginHorizontal: -20,
    marginBottom: Spacing.three,
  },
  loading: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: BottomTabInset + 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  fabIcon: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '400',
    marginTop: -2,
  },
});
