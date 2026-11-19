import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function EmptyState({
  emoji,
  title,
  message,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.emoji}>{emoji}</ThemedText>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.message}>
        {message}
      </ThemedText>
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} style={styles.action} />
      )}
      {secondaryLabel && onSecondary && (
        <Button label={secondaryLabel} onPress={onSecondary} variant="ghost" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emoji: {
    fontSize: 52,
    lineHeight: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    maxWidth: 300,
  },
  action: {
    alignSelf: 'stretch',
    marginTop: Spacing.three,
  },
});
