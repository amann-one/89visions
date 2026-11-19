import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { countdownLabel, formatDate } from '@/lib/format';
import { getCategory, type BucketItem } from '@/lib/models';

interface ItemCardProps {
  item: BucketItem;
  onPress: () => void;
  onToggleDone: () => void;
}

export function ItemCard({ item, onPress, onToggleDone }: ItemCardProps) {
  const theme = useTheme();
  const category = getCategory(item.category);
  const cover = item.coverThumbUrl ?? item.coverUrl;
  const isDone = item.status === 'done';
  const timing = isDone
    ? item.completedAt
      ? `Erlebt am ${formatDate(item.completedAt.slice(0, 10))}`
      : 'Erlebt'
    : countdownLabel(item.targetDate);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${category.label}`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          opacity: pressed ? 0.82 : 1,
        },
      ]}>
      <View style={[styles.cover, { backgroundColor: theme.backgroundSelected }]}>
        {cover ? (
          <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <ThemedText style={styles.coverEmoji}>{category.emoji}</ThemedText>
        )}
        {item.photoCount > 1 && (
          <View style={[styles.photoCount, { backgroundColor: theme.overlay }]}>
            <ThemedText style={styles.photoCountText}>{item.photoCount}</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText numberOfLines={2} style={styles.title}>
            {item.title}
          </ThemedText>
          <Pressable
            onPress={onToggleDone}
            hitSlop={10}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isDone }}
            accessibilityLabel={isDone ? 'Als offen markieren' : 'Als erledigt markieren'}
            style={[
              styles.check,
              {
                borderColor: isDone ? theme.success : theme.border,
                backgroundColor: isDone ? theme.success : 'transparent',
              },
            ]}>
            <ThemedText
              style={[styles.checkMark, { color: isDone ? theme.background : theme.textSecondary }]}>
              ✓
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {category.emoji} {category.label}
          {item.placeName ? ` · ${item.placeName}` : ''}
        </ThemedText>

        <View style={styles.metaRow}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  item.status === 'done'
                    ? theme.successSoft
                    : item.status === 'planned'
                      ? theme.accentSoft
                      : theme.backgroundSelected,
              },
            ]}>
            <ThemedText
              style={[
                styles.statusText,
                {
                  color:
                    item.status === 'done'
                      ? theme.success
                      : item.status === 'planned'
                        ? theme.accent
                        : theme.textSecondary,
                },
              ]}>
              {item.status === 'done' ? 'Erledigt' : item.status === 'planned' ? 'Geplant' : 'Idee'}
            </ThemedText>
          </View>

          {timing && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {timing}
            </ThemedText>
          )}

          {item.isFavorite && <ThemedText style={styles.favorite}>★</ThemedText>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: 10,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cover: {
    width: 88,
    height: 88,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverEmoji: {
    fontSize: 34,
    lineHeight: 42,
  },
  photoCount: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  favorite: {
    fontSize: 13,
    color: '#E0A100',
  },
});
