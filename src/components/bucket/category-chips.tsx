import { ScrollView, StyleSheet, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import { useCategoryTone } from '@/hooks/use-design';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORIES, type CategoryId } from '@/lib/models';

interface CategoryChipsProps {
  value: CategoryId | null;
  onChange: (value: CategoryId | null) => void;
  includeAll?: boolean;
}

export function CategoryChips({ value, onChange, includeAll = true }: CategoryChipsProps) {
  const entries = includeAll
    ? [{ id: null as CategoryId | null, label: 'Alle', emoji: '🌀' }, ...CATEGORIES]
    : CATEGORIES;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {entries.map((category) => (
        <Chip
          key={category.id ?? 'all'}
          id={category.id}
          label={category.label}
          emoji={category.emoji}
          selected={category.id === value}
          onPress={() => onChange(category.id)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  id,
  label,
  emoji,
  selected,
  onPress,
}: {
  id: CategoryId | null;
  label: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const tone = useCategoryTone(id ?? 'other');
  const strong = id === null ? theme.accent : tone.strong;
  const soft = id === null ? theme.accentSoft : tone.soft;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? strong : theme.backgroundElement,
          borderColor: selected ? strong : theme.border,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText
        style={[
          styles.label,
          { color: selected ? '#FFFFFF' : theme.textSecondary },
        ]}>
        {label}
      </ThemedText>
      {!selected && <View style={[styles.dot, { backgroundColor: soft, borderColor: strong }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 40,
  },
  emoji: {
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    marginLeft: 1,
  },
});
