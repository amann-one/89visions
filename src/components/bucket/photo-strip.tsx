import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

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
  /** Enables drag & drop reordering via the grip on each photo. */
  onReorder?: (from: number, to: number) => void;
  adding?: boolean;
  size?: number;
}

const GAP = Spacing.two;

interface DragState {
  from: number;
  to: number;
}

interface TileProps {
  photo: StripPhoto;
  index: number;
  count: number;
  size: number;
  drag: DragState | null;
  onRemove?: (id: string) => void;
  onReorder?: (from: number, to: number) => void;
  onDrag: (state: DragState | null) => void;
}

const gripWebStyle =
  Platform.OS === 'web'
    ? ({ cursor: 'grab', touchAction: 'none', userSelect: 'none' } as object)
    : null;

function PhotoTile({ photo, index, count, size, drag, onRemove, onReorder, onDrag }: TileProps) {
  const theme = useTheme();
  const [translateX] = useState(() => new Animated.Value(0));
  const latest = useRef({ index, count, size, onReorder, onDrag });
  const target = useRef(0);

  // Keep the gesture callbacks pointed at the current props.
  useEffect(() => {
    latest.current = { index, count, size, onReorder, onDrag };
  }, [index, count, size, onReorder, onDrag]);

  // The refs are only read inside gesture callbacks, never while rendering.
  // eslint-disable-next-line react-hooks/refs
  const [panResponder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const { index: from, onDrag: setDrag } = latest.current;
        target.current = from;
        setDrag({ from, to: from });
      },
      onPanResponderMove: (_event, gesture) => {
        const { index: from, count: total, size: tile, onDrag: setDrag } = latest.current;
        translateX.setValue(gesture.dx);
        const next = Math.max(
          0,
          Math.min(total - 1, Math.round(from + gesture.dx / (tile + GAP)))
        );
        if (next !== target.current) {
          target.current = next;
          setDrag({ from, to: next });
        }
      },
      onPanResponderRelease: () => {
        const { index: from, onReorder: reorder, onDrag: setDrag } = latest.current;
        translateX.setValue(0);
        setDrag(null);
        if (target.current !== from) {
          reorder?.(from, target.current);
        }
      },
      onPanResponderTerminate: () => {
        translateX.setValue(0);
        latest.current.onDrag(null);
      },
    })
  );

  const isDragged = drag?.from === index;
  let shift = 0;
  if (drag && !isDragged) {
    if (drag.from < index && index <= drag.to) {
      shift = -(size + GAP);
    } else if (drag.to <= index && index < drag.from) {
      shift = size + GAP;
    }
  }

  return (
    <Animated.View
      style={[
        { width: size, height: size },
        isDragged
          ? { zIndex: 10, transform: [{ translateX }, { scale: 1.06 }], opacity: 0.92 }
          : { transform: [{ translateX: shift }] },
      ]}>
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
      {onReorder && count > 1 && (
        <View
          {...panResponder.panHandlers}
          accessibilityLabel="Foto verschieben"
          style={[styles.grip, { backgroundColor: theme.overlay }, gripWebStyle]}>
          <ThemedText style={styles.gripText}>⠿</ThemedText>
        </View>
      )}
    </Animated.View>
  );
}

export function PhotoStrip({
  photos,
  onAdd,
  onRemove,
  onReorder,
  adding = false,
  size = 110,
}: PhotoStripProps) {
  const theme = useTheme();
  const [drag, setDrag] = useState<DragState | null>(null);

  return (
    <ScrollView
      horizontal
      scrollEnabled={!drag}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {photos.map((photo, index) => (
        <PhotoTile
          key={photo.id}
          photo={photo}
          index={index}
          count={photos.length}
          size={size}
          drag={drag}
          onRemove={onRemove}
          onReorder={onReorder}
          onDrag={setDrag}
        />
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
    gap: GAP,
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
  grip: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 32,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gripText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
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
