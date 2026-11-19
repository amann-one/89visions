import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/bucket/empty-state';
import { InlineError } from '@/components/bucket/inline-error';
import { PoweredBy } from '@/components/powered-by';
import { ThemedText } from '@/components/themed-text';
import { Gradient } from '@/components/ui/gradient';
import { Screen } from '@/components/ui/screen';
import { BottomTabInset, Elevation, Radius, Spacing } from '@/constants/theme';
import { useCategoryTone } from '@/hooks/use-design';
import { useItems } from '@/hooks/use-bucket-data';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatYear } from '@/lib/format';
import { getCategory, type BucketItem } from '@/lib/models';

export default function MemoriesScreen() {
  const theme = useTheme();
  const { items, loading, error, reload } = useItems({ status: 'done' });

  const sections = useMemo(() => {
    const groups = new Map<string, BucketItem[]>();
    for (const item of items) {
      const year = formatYear(item.completedAt);
      const bucket = groups.get(year) ?? [];
      bucket.push(item);
      groups.set(year, bucket);
    }
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
  }, [items]);

  return (
    <Screen belowTabBar>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: theme.accent }]}>
              {items.length} {items.length === 1 ? 'MOMENT' : 'MOMENTE'}
            </ThemedText>
            <ThemedText style={styles.heading}>Erinnerungen</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Alles, was du schon erlebt hast – mit Foto, Datum und Bewertung.
            </ThemedText>
            {error && (
              <View style={styles.errorWrap}>
                <InlineError message={error} onRetry={() => void reload()} />
              </View>
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <ThemedText style={[styles.sectionYear, { color: theme.text }]}>
              {section.title}
            </ThemedText>
            <View style={[styles.sectionLine, { backgroundColor: theme.border }]} />
            <View style={[styles.sectionCount, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText style={[styles.sectionCountText, { color: theme.textSecondary }]}>
                {section.data.length}
              </ThemedText>
            </View>
          </View>
        )}
        renderItem={({ item }) => <MemoryCard item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 4 }} />}
        ListFooterComponent={<PoweredBy />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.accent} />
            </View>
          ) : (
            <EmptyState
              emoji="📸"
              title="Noch keine Erinnerungen"
              message="Markiere ein Ziel als erledigt – mit Datum, Foto und Bewertung wird daraus ein Moment."
              actionLabel="Zur Bucket List"
              onAction={() => router.navigate('/')}
            />
          )
        }
      />
    </Screen>
  );
}

function MemoryCard({ item }: { item: BucketItem }) {
  const theme = useTheme();
  const category = getCategory(item.category);
  const tone = useCategoryTone(item.category);
  const cover = item.coverUrl ?? item.coverThumbUrl;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        { shadowColor: theme.shadow, transform: [{ scale: pressed ? 0.985 : 1 }] },
        Elevation.card,
      ]}>
      <View style={[styles.cardImage, { backgroundColor: theme.backgroundElement }]}>
        {cover ? (
          <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Gradient variant="dusk" style={StyleSheet.absoluteFill}>
            <View style={styles.fallbackInner}>
              <ThemedText style={styles.cardEmoji}>{category.emoji}</ThemedText>
            </View>
          </Gradient>
        )}

        <Gradient
          colors={['rgba(10,6,14,0)', 'rgba(10,6,14,0.35)', 'rgba(10,6,14,0.86)']}
          locations={[0.35, 0.62, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topRow}>
          <View style={[styles.categoryPill, { backgroundColor: 'rgba(255,255,255,0.92)' }]}>
            <ThemedText style={[styles.categoryText, { color: tone.strong }]}>
              {category.emoji} {category.label}
            </ThemedText>
          </View>
          {item.rating ? (
            <View style={styles.ratingPill}>
              <ThemedText style={styles.ratingText}>{'★'.repeat(item.rating)}</ThemedText>
            </View>
          ) : null}
        </View>

        <View style={styles.overlay}>
          <ThemedText style={styles.overlayMeta}>
            {formatDate(item.completedAt?.slice(0, 10))}
          </ThemedText>
          <ThemedText style={styles.overlayTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          {item.placeName && (
            <ThemedText style={styles.overlayPlace} numberOfLines={1}>
              📍 {item.placeName}
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: BottomTabInset + 60,
  },
  header: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    gap: 3,
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
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  sectionYear: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  sectionCount: {
    minWidth: 24,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  errorWrap: {
    marginTop: Spacing.two,
  },
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  cardImage: {
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 66,
    lineHeight: 78,
  },
  topRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  categoryText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
  },
  ratingPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 200, 74, 0.95)',
  },
  ratingText: {
    color: '#4A3200',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.three,
    gap: 2,
  },
  overlayMeta: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  overlayPlace: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 12,
    fontWeight: '600',
  },
  loading: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
});
