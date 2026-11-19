import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/bucket/empty-state';
import { InlineError } from '@/components/bucket/inline-error';
import { ProgressBar } from '@/components/bucket/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { BottomTabInset, Radius, Spacing } from '@/constants/theme';
import { useStats } from '@/hooks/use-bucket-data';
import { useTheme } from '@/hooks/use-theme';
import { formatEuro } from '@/lib/format';
import { CATEGORIES, getCategory } from '@/lib/models';

export default function StatsScreen() {
  const theme = useTheme();
  const { stats, loading, error, reload } = useStats();

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </Screen>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
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
  const maxYear = Math.max(...stats.byYear.map((entry) => entry.done), 1);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.eyebrow, { color: theme.textSecondary }]}>
          DEIN FORTSCHRITT
        </ThemedText>
        <ThemedText style={styles.heading}>Statistik</ThemedText>

        {error && (
          <View style={styles.errorWrap}>
            <InlineError message={error} onRetry={() => void reload()} />
          </View>
        )}

        <View style={styles.tiles}>
          <StatTile label="Erlebt" value={stats.done} color={theme.success} />
          <StatTile label="Offen" value={stats.total - stats.done} color={theme.accent} />
          <StatTile label="Favoriten" value={stats.favorites} color={theme.text} />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Gesamtfortschritt</ThemedText>
            <ThemedText style={[styles.percent, { color: theme.accent }]}>
              {Math.round(completion * 100)}%
            </ThemedText>
          </View>
          <ProgressBar value={completion} height={10} />
          <ThemedText type="small" themeColor="textSecondary">
            {stats.done} von {stats.total} Zielen erlebt · {stats.planned} geplant · {stats.ideas} Ideen
          </ThemedText>
          {stats.budget > 0 && (
            <View style={[styles.budgetRow, { borderTopColor: theme.border }]}>
              <ThemedText type="small" themeColor="textSecondary">
                Budget für offene Ziele
              </ThemedText>
              <ThemedText type="smallBold">{formatEuro(stats.budget)}</ThemedText>
            </View>
          )}
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <ThemedText style={styles.cardTitle}>Nach Kategorie</ThemedText>
          <View style={styles.categoryList}>
            {CATEGORIES.map((category) => {
              const entry = stats.byCategory.find((item) => item.category === category.id);
              const total = entry?.total ?? 0;
              const done = entry?.done ?? 0;
              if (total === 0) {
                return null;
              }
              return (
                <View key={category.id} style={styles.categoryRow}>
                  <View style={styles.categoryLabel}>
                    <ThemedText type="small">{category.emoji}</ThemedText>
                    <ThemedText type="small" style={styles.categoryName}>
                      {category.label}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {done}/{total}
                    </ThemedText>
                  </View>
                  <ProgressBar value={done / total} height={6} tone="success" />
                </View>
              );
            })}
            {stats.byCategory.length === 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                Keine Kategorien vorhanden.
              </ThemedText>
            )}
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
                  <ThemedText type="smallBold" style={styles.yearLabel}>
                    {entry.year}
                  </ThemedText>
                  <View style={styles.yearBarWrap}>
                    <ProgressBar value={entry.done / maxYear} height={8} />
                  </View>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.yearCount}>
                    {entry.done}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <ThemedText type="small" themeColor="textSecondary">
            {getCategory(stats.byCategory[0]?.category ?? 'other').emoji} Weiter so – jedes Ziel zählt.
          </ThemedText>
        </View>
      </ScrollView>
    </Screen>
  );
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <ThemedText style={[styles.tileValue, { color }]}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  heading: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginTop: -Spacing.two,
  },
  errorWrap: {
    marginHorizontal: -20,
  },
  tiles: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: 2,
  },
  tileValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
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
    fontWeight: '700',
  },
  percent: {
    fontSize: 22,
    fontWeight: '800',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
  categoryList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  categoryRow: {
    gap: 5,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryName: {
    flex: 1,
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
    width: 40,
  },
  yearBarWrap: {
    flex: 1,
  },
  yearCount: {
    width: 26,
    textAlign: 'right',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
});
