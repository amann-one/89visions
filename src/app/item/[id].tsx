import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { InlineError } from '@/components/bucket/inline-error';
import { PhotoStrip } from '@/components/bucket/photo-strip';
import { ProgressBar } from '@/components/bucket/progress-bar';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Gradient } from '@/components/ui/gradient';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useCategoryTone } from '@/hooks/use-design';
import { useItem } from '@/hooks/use-bucket-data';
import { useTheme } from '@/hooks/use-theme';
import { countdownLabel, formatDate, formatEuro } from '@/lib/format';
import { getCategory, getStatus } from '@/lib/models';
import { Alert } from '@/lib/alert';
import { deleteStoragePhoto } from '@/lib/storage';
import { setItemStatus, softDeleteItem, toggleFavorite } from '@/lib/repository';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { item, photos, loading, error, reload } = useItem(id);
  const tone = useCategoryTone(item?.category ?? 'other');

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, []);

  const onToggleStatus = useCallback(async () => {
    if (!item) {
      return;
    }
    try {
      const next = item.status === 'done' ? 'planned' : 'done';
      await setItemStatus(item.id, next, next === 'done' ? item.rating : null);
      void Haptics.notificationAsync(
        next === 'done'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
      await reload();
    } catch (cause) {
      Alert.alert('Fehler', cause instanceof Error ? cause.message : 'Status konnte nicht geändert werden.');
    }
  }, [item, reload]);

  const onToggleFavorite = useCallback(async () => {
    if (!item) {
      return;
    }
    try {
      await toggleFavorite(item.id, !item.isFavorite);
      void Haptics.selectionAsync();
      await reload();
    } catch (cause) {
      Alert.alert('Fehler', cause instanceof Error ? cause.message : 'Favorit konnte nicht geändert werden.');
    }
  }, [item, reload]);

  const onDelete = useCallback(() => {
    if (!item) {
      return;
    }
    Alert.alert('Ziel löschen?', `„${item.title}“ wird aus deiner Liste entfernt.`, [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await softDeleteItem(item.id);
            await Promise.all(photos.map((photo) => deleteStoragePhoto(photo.storagePath)));
            goBack();
          } catch (cause) {
            Alert.alert('Fehler', cause instanceof Error ? cause.message : 'Löschen fehlgeschlagen.');
          }
        },
      },
    ]);
  }, [item, photos, goBack]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background, padding: 24 }]}>
        <ThemedText style={styles.emptyTitle}>Eintrag nicht gefunden</ThemedText>
        {error && <ThemedText type="small" themeColor="textSecondary">{error}</ThemedText>}
        <Button label="Zurück zur Liste" onPress={goBack} style={{ marginTop: 16, alignSelf: 'stretch' }} />
      </View>
    );
  }

  const category = getCategory(item.category);
  const status = getStatus(item.status);
  const cover = item.coverUrl ?? item.coverThumbUrl;
  const timing = item.status === 'done'
    ? item.completedAt
      ? `Erlebt am ${formatDate(item.completedAt.slice(0, 10))}`
      : 'Erlebt'
    : countdownLabel(item.targetDate);
  const budgetProgress =
    item.costTarget && item.costTarget > 0 ? Math.min(item.costSaved / item.costTarget, 1) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.column}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.five }}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.cover, { backgroundColor: theme.backgroundElement }]}>
          {cover ? (
            <Image source={{ uri: cover }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Gradient variant="dusk" style={StyleSheet.absoluteFill}>
              <View style={styles.coverFallback}>
                <ThemedText style={styles.coverEmoji}>{category.emoji}</ThemedText>
                <ThemedText style={styles.coverFallbackText}>{category.label}</ThemedText>
              </View>
            </Gradient>
          )}

          <Gradient
            colors={['rgba(10,6,14,0)', 'rgba(10,6,14,0.55)']}
            start={{ x: 0.5, y: 0.35 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.coverFade}
          />

          <SafeAreaView edges={['top']} style={styles.coverBar} pointerEvents="box-none">
            <View style={styles.coverBarRow}>
              <Pressable
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="Zurück"
                style={[styles.roundButton, { backgroundColor: 'rgba(20,12,24,0.45)' }]}>
                <ThemedText style={styles.roundButtonText}>‹</ThemedText>
              </Pressable>
              <View style={styles.coverActions}>
                <Pressable
                  onPress={() => void onToggleFavorite()}
                  accessibilityRole="button"
                  accessibilityLabel="Favorit"
                  style={[styles.roundButton, { backgroundColor: 'rgba(20,12,24,0.45)' }]}>
                  <ThemedText style={[styles.roundButtonText, { color: item.isFavorite ? '#FFCE4A' : '#FFFFFF' }]}>
                    {item.isFavorite ? '★' : '☆'}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => router.push({ pathname: '/edit', params: { id: item.id } })}
                  accessibilityRole="button"
                  accessibilityLabel="Bearbeiten"
                  style={[styles.roundButton, styles.editButton]}>
                  <ThemedText style={styles.smallRoundText}>Bearbeiten</ThemedText>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: tone.soft }]}>
              <ThemedText type="smallBold" style={{ color: tone.strong }}>
                {category.emoji} {category.label}
              </ThemedText>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: item.status === 'done' ? theme.successSoft : theme.accentSoft },
              ]}>
              <ThemedText
                type="smallBold"
                style={{ color: item.status === 'done' ? theme.success : theme.accent }}>
                {status.label}
              </ThemedText>
            </View>
            {timing && (
              <ThemedText type="small" themeColor="textSecondary">
                {timing}
              </ThemedText>
            )}
          </View>

          <ThemedText style={styles.title}>{item.title}</ThemedText>

          {item.placeName && (
            <ThemedText type="default" themeColor="textSecondary">
              📍 {item.placeName}
            </ThemedText>
          )}

          {item.rating !== null && item.status === 'done' && (
            <ThemedText style={styles.rating}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</ThemedText>
          )}

          {error && <InlineError message={error} onRetry={() => void reload()} />}

          {item.note && (
            <View style={[styles.noteCard, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText style={styles.noteLabel}>NOTIZ</ThemedText>
              <ThemedText style={styles.noteText}>{item.note}</ThemedText>
            </View>
          )}

          <View style={styles.infoGrid}>
            <InfoCell label="Zieltermin" value={item.targetDate ? formatDate(item.targetDate) : '—'} />
            <InfoCell label="Ort" value={item.placeName ?? '—'} />
            <InfoCell label="Budget" value={item.costTarget ? formatEuro(item.costTarget) : '—'} />
            <InfoCell
              label="Gespurt"
              value={item.costTarget ? `${formatEuro(item.costSaved)} von ${formatEuro(item.costTarget)}` : '—'}
            />
          </View>

          {item.costTarget !== null && item.costTarget > 0 && (
            <View style={styles.budgetBlock}>
              <ProgressBar value={budgetProgress} height={7} tone="success" />
            </View>
          )}

          <View style={styles.photosBlock}>
            <View style={styles.photosHeader}>
              <ThemedText style={styles.sectionTitle}>Fotos</ThemedText>
              <Pressable
                onPress={() => router.push({ pathname: '/edit', params: { id: item.id } })}
                hitSlop={8}>
                <ThemedText type="smallBold" style={{ color: theme.accent }}>
                  {photos.length > 0 ? 'Verwalten' : 'Hinzufügen'}
                </ThemedText>
              </Pressable>
            </View>
            {photos.length > 0 ? (
              <PhotoStrip photos={photos.map((photo) => ({ id: photo.id, uri: photo.thumbUrl }))} />
            ) : (
              <Pressable
                onPress={() => router.push({ pathname: '/edit', params: { id: item.id } })}
                style={[
                  styles.photoPlaceholder,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}>
                <ThemedText style={{ fontSize: 28 }}>{category.emoji}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
                  {item.status === 'done'
                    ? 'Halte den Moment mit einem Foto fest.'
                    : 'Füge ein Bild hinzu, das dich motiviert.'}
                </ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.actions}>
            <Button
              label={item.status === 'done' ? 'Als offen markieren' : 'Als erledigt markieren'}
              onPress={() => void onToggleStatus()}
              variant={item.status === 'done' ? 'secondary' : 'primary'}
            />
            <Button
              label="Bearbeiten"
              onPress={() => router.push({ pathname: '/edit', params: { id: item.id } })}
              variant="secondary"
            />
            <Button label="Löschen" onPress={onDelete} variant="danger" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.infoCell, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
      <ThemedText type="smallBold" numberOfLines={2}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cover: {
    height: 340,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverEmoji: {
    fontSize: 88,
    lineHeight: 104,
  },
  coverFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  coverFallbackText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  coverFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  coverBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  coverBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  coverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  roundButton: {
    minWidth: 38,
    height: 38,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonText: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '600',
    marginTop: -3,
  },
  smallRoundText: {
    color: '#1B1520',
    fontSize: 12,
    fontWeight: '800',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  sheet: {
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
    minHeight: 400,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  rating: {
    fontSize: 18,
    letterSpacing: 2,
    color: '#E0A100',
  },
  noteCard: {
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: 4,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.55,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: Spacing.three,
    rowGap: Spacing.three,
  },
  infoCell: {
    width: '47%',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 3,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  budgetBlock: {
    marginTop: -Spacing.two,
  },
  photosBlock: {
    gap: Spacing.two,
  },
  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  photoPlaceholder: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    gap: 6,
  },
  actions: {
    gap: 10,
    marginTop: Spacing.two,
  },
});
