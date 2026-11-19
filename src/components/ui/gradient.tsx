import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { GradientName } from '@/constants/theme';
import { useGradient } from '@/hooks/use-design';

interface GradientProps {
  /** Named gradient from the active color scheme. */
  variant?: GradientName;
  /** Override the stops, e.g. for photo overlays. */
  colors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: readonly [number, number, ...number[]];
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * Thin wrapper around `LinearGradient` so screens only name a gradient
 * instead of hard-coding stops for light and dark mode.
 */
export function Gradient({
  variant = 'sunset',
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  locations,
  style,
  children,
}: GradientProps) {
  const preset = useGradient(variant);

  return (
    <LinearGradient
      colors={colors ?? preset}
      start={start}
      end={end}
      locations={locations}
      style={style}>
      {children}
    </LinearGradient>
  );
}
