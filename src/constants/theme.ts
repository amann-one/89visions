/**
 * Design tokens for the app. Colors exist for light and dark mode so that
 * `useTheme()` can resolve the right value for the current scheme.
 *
 * The palette is intentionally warm and saturated – coral, amber and magenta
 * against a paper-white background – so the list feels like a travel journal
 * rather than a spreadsheet.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1B1520',
    background: '#FFFBF6',
    /** Cards and sheets that should lift off the background. */
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F6EDE2',
    textSecondary: '#6E6779',
    border: '#F0E4D6',
    accent: '#F2542D',
    accentAlt: '#FF9A45',
    accentSoft: '#FFE8DE',
    accentContrast: '#FFFFFF',
    success: '#0E9F6E',
    successSoft: '#DBF6EA',
    warning: '#B4690E',
    highlight: '#FFB300',
    overlay: 'rgba(24, 15, 28, 0.52)',
    glow: 'rgba(242, 84, 45, 0.22)',
    shadow: '#8C4A2A',
  },
  dark: {
    text: '#FBF5EE',
    background: '#0D0A10',
    backgroundElement: '#181320',
    backgroundSelected: '#25202F',
    textSecondary: '#A49DB2',
    border: '#2C2539',
    accent: '#FF7A50',
    accentAlt: '#FFB067',
    accentSoft: '#3B1F17',
    accentContrast: '#1A0C07',
    success: '#3ED598',
    successSoft: '#103327',
    warning: '#E5B356',
    highlight: '#FFC94A',
    overlay: 'rgba(0, 0, 0, 0.58)',
    glow: 'rgba(255, 122, 80, 0.24)',
    shadow: '#000000',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type ColorSchemeName = 'light' | 'dark';

/** Multi-stop gradients used for hero cards, the FAB and photo overlays. */
export const Gradients = {
  light: {
    sunset: ['#FF6B35', '#F5306A'] as const,
    ember: ['#FF9A45', '#F2542D'] as const,
    mint: ['#34D399', '#0E9F6E'] as const,
    gold: ['#FFC24B', '#F2900A'] as const,
    dusk: ['#2B1B33', '#4A1B2B'] as const,
  },
  dark: {
    sunset: ['#FF6E4A', '#D0306F'] as const,
    ember: ['#FF9455', '#E24B22'] as const,
    mint: ['#3ED598', '#0B8A5F'] as const,
    gold: ['#FFCB5C', '#E39B00'] as const,
    dusk: ['#241A2E', '#3D1626'] as const,
  },
} as const;

export type GradientName = keyof typeof Gradients.light;

/** Per-category accent colors for chips, badges and stat bars. */
export const CategoryTones = {
  light: {
    travel: { strong: '#2F7DF6', soft: '#E4EEFF' },
    adventure: { strong: '#F2542D', soft: '#FFE7DE' },
    food: { strong: '#E8890C', soft: '#FFF0D6' },
    learning: { strong: '#7A5AF8', soft: '#ECE7FF' },
    people: { strong: '#E8477E', soft: '#FFE4EE' },
    other: { strong: '#0FA3A3', soft: '#DDF5F5' },
  },
  dark: {
    travel: { strong: '#7FB0FF', soft: '#16263E' },
    adventure: { strong: '#FF8B63', soft: '#3A1D14' },
    food: { strong: '#FFB74A', soft: '#3B2A10' },
    learning: { strong: '#A996FF', soft: '#241C45' },
    people: { strong: '#FF7FA8', soft: '#3B1626' },
    other: { strong: '#4BD0CE', soft: '#11302F' },
  },
} as const;

export type CategoryTone = { strong: string; soft: string };

/** Soft drop shadows. Kept subtle – mobile GPUs notice heavy blurs. */
export const Elevation = {
  card: {
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    shadowOpacity: 0.07,
    elevation: 3,
  },
  floating: {
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    shadowOpacity: 0.24,
    elevation: 9,
  },
} as const;

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
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 480;
