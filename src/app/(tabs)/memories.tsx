import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/bucket/empty-state';
import { InlineError } from '@/components/bucket/inline-error';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
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
    <Screen>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={[styles.eyebrow, { color: theme.textSecondary }]}>
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
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {section.title}
          </ThemedText>
        )}
        renderItem={({ item }) => <MemoryCard item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        SectionSeparatorComponent={() => <View style={{ height: 6 }} />}
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
  const cover = item.coverUrl ?? item.coverThumbUrl;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.88 : 1 }]}>
      <View style={[styles.cardImage, { backgroundColor: theme.backgroundElement }]}>
        {cover ? (
          <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <ThemedText style={styles.cardEmoji}>{category.emoji}</ThemedText>
        )}
        <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
          <ThemedText style={styles.overlayMeta}>
            {category.emoji} {formatDate(item.completedAt?.slice(0, 10))}
            {item.rating ? `  ${'★'.repeat(item.rating)}` : ''}
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
    paddingBottom: Spacing.three,
    gap: 4,
    marginHorizontal: -20,
    paddingHorizontal: 20,
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
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    paddingVertical: Spacing.two,
  },
  errorWrap: {
    marginTop: Spacing.two,
    marginHorizontal: -20,
  },
  card: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  cardImage: {
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 60,
    lineHeight: 72,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.three,
    gap: 1,
  },
  overlayMeta: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    opacity: 0.85,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
  },
  overlayPlace: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.85,
  },
  loading: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
});
