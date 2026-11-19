import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/bucket/empty-state';
import { InlineError } from '@/components/bucket/inline-error';
import { ThemedText } from '@/components/themed-text';
import { Gradient } from '@/components/ui/gradient';
import { Screen } from '@/components/ui/screen';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useCategoryTone } from '@/hooks/use-design';
import { useStats } from '@/hooks/use-bucket-data';
import { useTheme } from '@/hooks/use-theme';
import { formatEuro } from '@/lib/format';
import { CATEGORIES, type CategoryId } from '@/lib/models';

export default function StatsScreen() {
  const theme = useTheme();
  const { stats, loading, error, reload } = useStats();

  if (loading) {
    return (
      <Screen belowTabBar>
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </Screen>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Screen belowTabBar>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText style={[styles.eyebrow, { color: theme.accent }]}>DEIN FORTSCHRITT</ThemedText>
          <ThemedText style={styles.heading}>Statistik</ThemedText>
          {error ? (
            <InlineError message={error} onRetry={() => void reload()} />
          ) : (
            <EmptyState
              emoji="📊"
              title="Noch nichts zu zählen"
              message="Sobald deine ersten Ziele da sind, siehst du hier deinen Fortschritt."
              actionLabel="Ziel anlegen"
              onAction={() => router.push('/edit')}
            />
          )}
        </ScrollView>
      </Screen>
    );
  }

  const completion = stats.total > 0 ? stats.done / stats.total : 0;
  const percent = Math.round(completion * 100);
  const maxYear = Math.max(...stats.byYear.map((entry) => entry.done), 1);

  return (
    <Screen belowTabBar>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.eyebrow, { color: theme.accent }]}>DEIN FORTSCHRITT</ThemedText>
        <ThemedText style={styles.heading}>Statistik</ThemedText>

        {error && (
          <View style={styles.errorWrap}>
            <InlineError message={error} onRetry={() => void reload()} />
          </View>
        )}

        <Gradient variant="sunset" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1.1 }} style={styles.hero}>
          <View pointerEvents="none" style={styles.heroBlob} />
          <View style={styles.heroTop}>
            <View style={styles.heroText}>
              <ThemedText style={styles.heroEyebrow}>GESAMTFORTSCHRITT</ThemedText>
              <ThemedText style={styles.heroPercent}>{percent}%</ThemedText>
              <ThemedText style={styles.heroCaption}>
                {stats.done} von {stats.total} Zielen erlebt
              </ThemedText>
            </View>
            <View style={styles.heroRing}>
              <ThemedText style={styles.heroRingValue}>{stats.done}</ThemedText>
              <ThemedText style={styles.heroRingLabel}>erlebt</ThemedText>
            </View>
          </View>

          <View style={styles.heroTrack}>
            <View style={[styles.heroFill, { width: `${Math.max(completion * 100, stats.done > 0 ? 5 : 0)}%` }]} />
          </View>

          <View style={styles.heroFooter}>
            <ThemedText style={styles.heroFooterText}>{stats.planned} geplant</ThemedText>
            <View style={styles.heroDivider} />
            <ThemedText style={styles.heroFooterText}>{stats.ideas} Ideen</ThemedText>
            {stats.budget > 0 && (
              <>
                <View style={styles.heroDivider} />
                <ThemedText style={styles.heroFooterText}>{formatEuro(stats.budget)} offen</ThemedText>
              </>
            )}
          </View>
        </Gradient>

        <View style={styles.tiles}>
          <StatTile label="Erlebt" value={stats.done} emoji="🏆" tint={theme.successSoft} ink={theme.success} />
          <StatTile label="Offen" value={stats.total - stats.done} emoji="🚀" tint={theme.accentSoft} ink={theme.accent} />
          <StatTile label="Favoriten" value={stats.favorites} emoji="★" tint={theme.backgroundSelected} ink={theme.highlight} />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Nach Kategorie</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {stats.total} Ziele
            </ThemedText>
          </View>
          <View style={styles.categoryList}>
            {CATEGORIES.map((category) => {
              const entry = stats.byCategory.find((item) => item.category === category.id);
              const total = entry?.total ?? 0;
              const done = entry?.done ?? 0;
              if (total === 0) {
                return null;
              }
              return (
                <CategoryRow
                  key={category.id}
                  category={category.id}
                  emoji={category.emoji}
                  label={category.label}
                  done={done}
                  total={total}
                />
              );
            })}
          </View>
        </View>

        {stats.byYear.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            <ThemedText style={styles.cardTitle}>Erlebnisse pro Jahr</ThemedText>
            <View style={styles.yearList}>
              {stats.byYear.map((entry) => (
                <View key={entry.year} style={styles.yearRow}>
                  <ThemedText style={[styles.yearLabel, { color: theme.textSecondary }]}>
                    {entry.year}
                  </ThemedText>
                  <View style={[styles.yearTrack, { backgroundColor: theme.backgroundSelected }]}>
                    <Gradient
                      variant="ember"
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        width: `${Math.max((entry.done / maxYear) * 100, 8)}%`,
                        height: 8,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                  <ThemedText style={[styles.yearCount, { color: theme.text }]}>
                    {entry.done}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <ThemedText type="small" themeColor="textSecondary">
            Weiter so – jedes Ziel zählt. ✨
          </ThemedText>
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatTile({
  label,
  value,
  emoji,
  tint,
  ink,
}: {
  label: string;
  value: number;
  emoji: string;
  tint: string;
  ink: string;
}) {
  return (
    <View style={[styles.tile, { backgroundColor: tint }]}>
      <ThemedText style={[styles.tileEmoji, { color: ink }]}>{emoji}</ThemedText>
      <ThemedText style={[styles.tileValue, { color: ink }]}>{value}</ThemedText>
      <ThemedText style={[styles.tileLabel, { color: ink }]}>{label}</ThemedText>
    </View>
  );
}

function CategoryRow({
  category,
  emoji,
  label,
  done,
  total,
}: {
  category: CategoryId;
  emoji: string;
  label: string;
  done: number;
  total: number;
}) {
  const theme = useTheme();
  const tone = useCategoryTone(category);

  return (
    <View style={styles.categoryRow}>
      <View style={styles.categoryLabel}>
        <View style={[styles.categoryBadge, { backgroundColor: tone.soft }]}>
          <ThemedText style={styles.categoryEmoji}>{emoji}</ThemedText>
        </View>
        <ThemedText style={[styles.categoryName, { color: theme.text }]}>{label}</ThemedText>
        <ThemedText style={{ color: tone.strong, fontSize: 12, fontWeight: '800' }}>
          {done}/{total}
        </ThemedText>
      </View>
      <View style={[styles.categoryTrack, { backgroundColor: theme.backgroundSelected }]}>
        <View
          style={{
            width: `${Math.max((done / total) * 100, done > 0 ? 8 : 0)}%`,
            height: 7,
            borderRadius: 4,
            backgroundColor: tone.strong,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + 60,
    gap: Spacing.three,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: -Spacing.two,
  },
  errorWrap: {
    marginHorizontal: -20,
  },
  hero: {
    borderRadius: Radius.xl,
    padding: Spacing.four,
    gap: Spacing.three,
    overflow: 'hidden',
    shadowColor: '#C4320C',
    shadowOpacity: 0.26,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  heroBlob: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    right: -60,
    bottom: -70,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  heroPercent: {
    color: '#FFFFFF',
    fontSize: 46,
    lineHeight: 52,
    fontWeight: '800',
    letterSpacing: -1.6,
  },
  heroCaption: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  heroRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  heroRingLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'hidden',
  },
  heroFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroFooterText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '700',
  },
  heroDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  tiles: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: 1,
  },
  tileEmoji: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 2,
  },
  tileValue: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.75,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  categoryList: {
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  categoryRow: {
    gap: 7,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 13,
    lineHeight: 17,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  categoryTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  yearList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  yearLabel: {
    width: 42,
    fontSize: 12,
    fontWeight: '800',
  },
  yearTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  yearCount: {
    width: 26,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
});
