/**
 * Design tokens for the app. Colors exist for light and dark mode so that
 * `useTheme()` can resolve the right value for the current scheme.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17161C',
    background: '#FBFAF7',
    backgroundElement: '#F2EFE9',
    backgroundSelected: '#E8E3DA',
    textSecondary: '#6C6A72',
    border: '#E5E0D7',
    accent: '#E4552D',
    accentSoft: '#FBE8E1',
    accentContrast: '#FFFFFF',
    success: '#1E8A5D',
    successSoft: '#E2F3EA',
    warning: '#A96A12',
    overlay: 'rgba(15, 13, 20, 0.45)',
  },
  dark: {
    text: '#F6F3EC',
    background: '#0E0D12',
    backgroundElement: '#1A1820',
    backgroundSelected: '#262330',
    textSecondary: '#9D9AA6',
    border: '#2B2835',
    accent: '#FF7A52',
    accentSoft: '#3B2119',
    accentContrast: '#1A0E0A',
    success: '#54D9A1',
    successSoft: '#123227',
    warning: '#E3B341',
    overlay: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 720;
