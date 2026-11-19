import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Gradient } from '@/components/ui/gradient';
import { Elevation, Radius } from '@/constants/theme';
import { useCategoryTone } from '@/hooks/use-design';
import { useTheme } from '@/hooks/use-theme';
import { countdownLabel, formatDate } from '@/lib/format';
import { getCategory, type BucketItem } from '@/lib/models';

interface ItemCardProps {
  item: BucketItem;
  onPress: () => void;
  onToggleDone: () => void;
}

const STATUS_LABEL: Record<BucketItem['status'], string> = {
  idea: 'Idee',
  planned: 'Geplant',
  done: 'Erlebt',
};

export function ItemCard({ item, onPress, onToggleDone }: ItemCardProps) {
  const theme = useTheme();
  const category = getCategory(item.category);
  const tone = useCategoryTone(item.category);
  const cover = item.coverThumbUrl ?? item.coverUrl;
  const isDone = item.status === 'done';
  const timing = isDone
    ? item.completedAt
      ? formatDate(item.completedAt.slice(0, 10))
      : null
    : countdownLabel(item.targetDate);

  const statusColor =
    item.status === 'done' ? theme.success : item.status === 'planned' ? theme.accent : theme.textSecondary;
  const statusSoft =
    item.status === 'done' ? theme.successSoft : item.status === 'planned' ? theme.accentSoft : theme.backgroundSelected;

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
          shadowColor: theme.shadow,
          transform: [{ scale: pressed ? 0.985 : 1 }],
          opacity: pressed ? 0.94 : 1,
        },
        Elevation.card,
      ]}>
      <View style={styles.coverWrap}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.coverImage} contentFit="cover" />
        ) : (
          <Gradient
            colors={[tone.soft, tone.soft]}
            style={[styles.coverFallback, { borderColor: tone.soft }]}>
            <ThemedText style={styles.coverEmoji}>{category.emoji}</ThemedText>
          </Gradient>
        )}
        {item.photoCount > 1 && (
          <View style={[styles.photoCount, { backgroundColor: theme.overlay }]}>
            <ThemedText style={styles.photoCountText}>◍ {item.photoCount}</ThemedText>
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
            hitSlop={12}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isDone }}
            accessibilityLabel={isDone ? 'Als offen markieren' : 'Als erledigt markieren'}
            style={[
              styles.check,
              {
                borderColor: isDone ? 'transparent' : theme.border,
                backgroundColor: isDone ? theme.success : 'transparent',
              },
            ]}>
            <ThemedText style={[styles.checkMark, { color: isDone ? '#FFFFFF' : theme.border }]}>
              ✓
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.categoryRow}>
          <View style={[styles.categoryPill, { backgroundColor: tone.soft }]}>
            <ThemedText style={[styles.categoryText, { color: tone.strong }]}>
              {category.emoji} {category.label}
            </ThemedText>
          </View>
          {item.placeName ? (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.place}>
              {item.placeName}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.statusPill, { backgroundColor: statusSoft }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <ThemedText style={[styles.statusText, { color: statusColor }]}>
              {STATUS_LABEL[item.status]}
            </ThemedText>
          </View>

          {timing ? (
            <ThemedText
              type="small"
              numberOfLines={1}
              style={{ color: isDone ? theme.textSecondary : theme.accent, fontWeight: '700' }}>
              {timing}
            </ThemedText>
          ) : null}

          <View style={styles.spacer} />

          {item.isFavorite && (
            <View style={[styles.favoritePill, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText style={[styles.favorite, { color: theme.highlight }]}>★</ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 10,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  coverWrap: {
    width: 92,
    height: 92,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: {
    fontSize: 36,
    lineHeight: 44,
  },
  photoCount: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
    gap: 6,
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
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  check: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '800',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  categoryText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '800',
  },
  place: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  spacer: {
    flex: 1,
  },
  favoritePill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favorite: {
    fontSize: 12,
    lineHeight: 15,
  },
});
