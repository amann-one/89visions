import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { setScheme } from '@/lib/color-scheme-store';

export function ThemeToggle() {
  const scheme = useColorScheme();
  const theme = useTheme();
  const isDark = scheme === 'dark';

  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        setScheme(isDark ? 'light' : 'dark');
      }}
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      accessibilityLabel={isDark ? 'Auf helles Design wechseln' : 'Auf dunkles Design wechseln'}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
      ]}>
      <ThemedText style={styles.icon}>{isDark ? '☀️' : '🌙'}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    lineHeight: 22,
  },
});
