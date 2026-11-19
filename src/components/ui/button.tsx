import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Gradient } from '@/components/ui/gradient';
import { Elevation, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const background =
    variant === 'primary'
      ? theme.accent
      : variant === 'danger'
        ? theme.accentSoft
        : variant === 'secondary'
          ? theme.backgroundElement
          : 'transparent';

  const foreground =
    variant === 'primary'
      ? theme.accentContrast
      : variant === 'danger'
        ? theme.accent
        : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor: variant === 'secondary' ? theme.border : 'transparent',
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.86 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
          shadowColor: theme.accent,
        },
        variant === 'primary' && Elevation.floating,
        style,
      ]}>
      {variant === 'primary' && (
        <Gradient
          variant="sunset"
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <ThemedText style={[styles.label, { color: foreground }]}>{label}</ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    overflow: 'hidden',
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
});
