import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Gradient } from '@/components/ui/gradient';
import { Radius, Spacing } from '@/constants/theme';

interface HeroCardProps {
  done: number;
  total: number;
  nextTitle?: string | null;
  nextTiming?: string | null;
  onShuffle: () => void;
  onOpenNext?: () => void;
}

/**
 * The dashboard header of the list: progress at a glance plus a shortcut to
 * whatever is coming up next. Deliberately large so it reads instantly on a
 * phone and gives the screen a clear focal point.
 */
export function HeroCard({
  done,
  total,
  nextTitle,
  nextTiming,
  onShuffle,
  onOpenNext,
}: HeroCardProps) {
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const trackWidth = total > 0 ? Math.max((done / total) * 100, done > 0 ? 6 : 0) : 0;

  return (
    <Gradient
      variant="sunset"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1.1 }}
      style={styles.card}>
      <View pointerEvents="none" style={styles.blobLarge} />
      <View pointerEvents="none" style={styles.blobSmall} />

      <View style={styles.top}>
        <View style={styles.countBlock}>
          <ThemedText style={styles.eyebrow}>DEIN FORTSCHRITT</ThemedText>
          <ThemedText style={styles.count}>
            {done}
            <ThemedText style={styles.countSuffix}> / {total}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.countLabel}>
            {done === 0 ? 'Noch kein Ziel erlebt' : 'Ziele erlebt'}
          </ThemedText>
        </View>

        <Pressable
          onPress={onShuffle}
          accessibilityRole="button"
          accessibilityLabel="Zufälliges Ziel öffnen"
          style={({ pressed }) => [styles.percentBubble, { opacity: pressed ? 0.75 : 1 }]}>
          <ThemedText style={styles.percent}>{percent}%</ThemedText>
          <ThemedText style={styles.dice}>🎲</ThemedText>
        </Pressable>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${trackWidth}%` }]} />
      </View>

      {nextTitle ? (
        <Pressable
          onPress={onOpenNext}
          accessibilityRole="button"
          accessibilityLabel={`Nächstes Ziel: ${nextTitle}`}
          style={({ pressed }) => [styles.nextRow, { opacity: pressed ? 0.75 : 1 }]}>
          <View style={styles.nextDot} />
          <View style={styles.nextText}>
            <ThemedText style={styles.nextLabel}>ALS NÄCHSTES</ThemedText>
            <ThemedText numberOfLines={1} style={styles.nextTitle}>
              {nextTitle}
            </ThemedText>
          </View>
          {nextTiming ? (
            <ThemedText style={styles.nextTiming}>{nextTiming}</ThemedText>
          ) : (
            <ThemedText style={styles.nextChevron}>›</ThemedText>
          )}
        </Pressable>
      ) : (
        <View style={styles.nextRow}>
          <View style={styles.nextDot} />
          <ThemedText style={styles.nextTitle}>
            {total === 0 ? 'Leg dein erstes Ziel an' : 'Alles erledigt – stark!'}
          </ThemedText>
        </View>
      )}
    </Gradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
    overflow: 'hidden',
    shadowColor: '#C4320C',
    shadowOpacity: 0.28,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  blobLarge: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    top: -110,
    right: -50,
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  blobSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    bottom: -46,
    left: 24,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  countBlock: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  count: {
    color: '#FFFFFF',
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  countSuffix: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  countLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  percentBubble: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  percent: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dice: {
    fontSize: 13,
    lineHeight: 16,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  nextDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFE2A8',
  },
  nextText: {
    flex: 1,
    gap: 1,
  },
  nextLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  nextTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  nextTiming: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  nextChevron: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginTop: -2,
  },
});
