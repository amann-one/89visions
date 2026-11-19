import { StyleSheet, View } from 'react-native';

import { Gradient } from '@/components/ui/gradient';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ProgressBarProps {
  value: number;
  height?: number;
  tone?: 'accent' | 'success';
  trackColor?: string;
  color?: string;
  /** Use a solid color instead of the tone's gradient. */
  flat?: boolean;
}

export function ProgressBar({
  value,
  height = 8,
  tone = 'accent',
  trackColor,
  color: fillColor,
  flat = false,
}: ProgressBarProps) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const color = fillColor ?? (tone === 'success' ? theme.success : theme.accent);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height,
          backgroundColor: trackColor ?? theme.backgroundSelected,
        },
      ]}>
      <View style={{ width: `${clamped * 100}%`, height, borderRadius: height, overflow: 'hidden' }}>
        {flat ? (
          <View style={{ flex: 1, backgroundColor: color }} />
        ) : (
          <Gradient
            variant={tone === 'success' ? 'mint' : 'sunset'}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: Radius.pill,
  },
});
