import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Gradient } from '@/components/ui/gradient';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}>
      <View style={styles.orbWrap}>
        <Gradient variant="sunset" style={styles.orb}>
          <View style={[styles.orbInner, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText style={styles.emoji}>{emoji}</ThemedText>
          </View>
        </Gradient>
      </View>

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
  card: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    marginTop: Spacing.two,
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.two,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  orbWrap: {
    marginBottom: Spacing.two,
  },
  orb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 40,
    lineHeight: 48,
  },
  title: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
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
