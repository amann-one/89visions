import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface StripPhoto {
  id: string;
  uri: string;
}

interface PhotoStripProps {
  photos: StripPhoto[];
  onAdd?: () => void;
  onRemove?: (id: string) => void;
  adding?: boolean;
  size?: number;
}

export function PhotoStrip({ photos, onAdd, onRemove, adding = false, size = 110 }: PhotoStripProps) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {photos.map((photo) => (
        <View key={photo.id} style={{ width: size, height: size }}>
          <Image
            source={{ uri: photo.uri }}
            style={[styles.photo, { backgroundColor: theme.backgroundSelected }]}
            contentFit="cover"
          />
          {onRemove && (
            <Pressable
              onPress={() => onRemove(photo.id)}
              accessibilityLabel="Foto entfernen"
              style={[styles.remove, { backgroundColor: theme.overlay }]}>
              <ThemedText style={styles.removeText}>✕</ThemedText>
            </Pressable>
          )}
        </View>
      ))}

      {onAdd && (
        <Pressable
          onPress={onAdd}
          disabled={adding}
          accessibilityRole="button"
          accessibilityLabel="Foto hinzufügen"
          style={[
            styles.add,
            {
              width: size,
              height: size,
              borderColor: theme.border,
              backgroundColor: theme.backgroundElement,
            },
          ]}>
          {adding ? (
            <ActivityIndicator color={theme.accent} />
          ) : (
            <>
              <ThemedText style={{ fontSize: 26, color: theme.accent }}>＋</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Foto
              </ThemedText>
            </>
          )}
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: Radius.md,
  },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  add: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
});
