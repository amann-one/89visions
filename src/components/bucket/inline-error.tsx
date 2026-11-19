import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.accentSoft }]}>
      <ThemedText style={styles.icon}>⚠️</ThemedText>
      <View style={styles.textContainer}>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          Verbindung fehlgeschlagen
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
          {message}
        </ThemedText>
      </View>
      {onRetry && (
        <Pressable onPress={onRetry} hitSlop={8}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            Erneut
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: 20,
    padding: Spacing.three,
    borderRadius: Radius.md,
  },
  icon: {
    fontSize: 18,
    lineHeight: 22,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
});
