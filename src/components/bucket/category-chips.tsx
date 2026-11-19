import { ScrollView, StyleSheet, Pressable } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { CATEGORIES, type CategoryId } from '@/lib/models';
import { ThemedText } from '@/components/themed-text';

interface CategoryChipsProps {
  value: CategoryId | null;
  onChange: (value: CategoryId | null) => void;
  includeAll?: boolean;
}

export function CategoryChips({ value, onChange, includeAll = true }: CategoryChipsProps) {
  const theme = useTheme();
  const entries = includeAll
    ? [{ id: null as CategoryId | null, label: 'Alle', emoji: '🌀' }, ...CATEGORIES]
    : CATEGORIES;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {entries.map((category) => {
        const selected = category.id === value;
        return (
          <Pressable
            key={category.id ?? 'all'}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(category.id)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? theme.text : theme.backgroundElement,
                borderColor: selected ? theme.text : theme.border,
              },
            ]}>
            <ThemedText style={styles.emoji}>{category.emoji}</ThemedText>
            <ThemedText
              type="smallBold"
              style={{ color: selected ? theme.background : theme.textSecondary }}>
              {category.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emoji: {
    fontSize: 13,
    lineHeight: 18,
  },
});
