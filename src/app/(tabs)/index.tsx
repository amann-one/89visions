import { randomUUID } from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SectionList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
  Alert,
} from 'react-native';

import { CategoryChips } from '@/components/bucket/category-chips';
import { EmptyState } from '@/components/bucket/empty-state';
import { HeroCard } from '@/components/bucket/hero-card';
import { InlineError } from '@/components/bucket/inline-error';
import { ItemCard } from '@/components/bucket/item-card';
import { ThemedText } from '@/components/themed-text';
import { Gradient } from '@/components/ui/gradient';
import { Screen } from '@/components/ui/screen';
import { BottomTabInset, Elevation, Radius, Spacing } from '@/constants/theme';
import { useItems } from '@/hooks/use-bucket-data';
import { useTheme } from '@/hooks/use-theme';
import { countdownLabel } from '@/lib/format';
import type { BucketItem, CategoryId, ItemStatus } from '@/lib/models';
import { insertDemoItems, setItemStatus } from '@/lib/repository';
import { isSupabaseConfigured } from '@/lib/supabase';

const SECTION_META: { status: ItemStatus; title: string }[] = [
  { status: 'planned', title: 'Demnächst' },
  { status: 'idea', title: 'Ideen' },
  { status: 'done', title: 'Erlebt' },
];

export default function BucketListScreen() {
  const theme = useTheme();
  const { items, loading, error, reload } = useItems({});
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const doneCount = items.filter((item) => item.status === 'done').length;

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

  const sections = useMemo(() => {
    return SECTION_META.map((meta) => ({
      ...meta,
      data: visibleItems.filter((item) => item.status === meta.status),
    })).filter((section) => section.data.length > 0);
  }, [visibleItems]);

  const nextItem = useMemo(() => {
    const open = items.filter((item) => item.status !== 'done');
    return (
      open.find((item) => item.status === 'planned' && item.targetDate) ??
      open.find((item) => item.status === 'planned') ??
      open[0] ??
      null
    );
  }, [items]);

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

  const openItem = useCallback((item: BucketItem) => {
    router.push({ pathname: '/item/[id]', params: { id: item.id } });
  }, []);

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <ThemedText style={[styles.eyebrow, { color: theme.accent }]}>
            {isSupabaseConfigured ? 'DEIN LEBEN, DEINE LISTE' : 'SUPABASE NICHT VERBUNDEN'}
          </ThemedText>
          <ThemedText style={styles.heading}>Bucket List</ThemedText>
        </View>
        <Pressable
          onPress={() => router.push('/edit')}
          accessibilityRole="button"
          accessibilityLabel="Neues Ziel anlegen"
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
          ]}>
          <ThemedText style={[styles.addIcon, { color: theme.accent }]}>＋</ThemedText>
        </Pressable>
      </View>

      <HeroCard
        done={doneCount}
        total={items.length}
        nextTitle={nextItem?.title ?? null}
        nextTiming={nextItem ? countdownLabel(nextItem.targetDate) : null}
        onShuffle={surpriseMe}
        onOpenNext={nextItem ? () => openItem(nextItem) : undefined}
      />

      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
            shadowColor: theme.shadow,
          },
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

      {error && (
        <View style={styles.errorWrap}>
          <InlineError message={error} onRetry={() => void reload()} />
        </View>
      )}
    </View>
  );

  return (
    <Screen belowTabBar>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.textSecondary}
          />
        }
        ListHeaderComponent={header}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              {section.title}
            </ThemedText>
            <View style={[styles.sectionCount, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText style={[styles.sectionCountText, { color: theme.textSecondary }]}>
                {section.data.length}
              </ThemedText>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => openItem(item)}
            onToggleDone={() => void toggleDone(item.id, item.status === 'done')}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 2 }} />}
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
          { shadowColor: theme.accent, transform: [{ scale: pressed ? 0.94 : 1 }] },
          Elevation.floating,
        ]}>
        <Gradient variant="sunset" style={StyleSheet.absoluteFill} />
        <ThemedText style={styles.fabIcon}>＋</ThemedText>
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
    paddingBottom: 2,
  },
  titleBlock: {
    gap: 3,
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  heading: {
    fontSize: 36,
    lineHeight: 41,
    fontWeight: '800',
    letterSpacing: -1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '600',
    marginTop: -1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  errorWrap: {
    marginHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionCount: {
    minWidth: 22,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  loading: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: BottomTabInset + 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '400',
    marginTop: -2,
  },
});
