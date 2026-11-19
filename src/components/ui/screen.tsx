import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ScreenProps {
  children: ReactNode;
  style?: ViewStyle;
  /** Use `bottom` for screens that are not inside the native tab bar. */
  bottomInset?: boolean;
  /**
   * Tab screens on the web render the tab bar as a floating pill at the top of
   * the window, so the content needs to start below it.
   */
  belowTabBar?: boolean;
}

export function Screen({
  children,
  style,
  bottomInset = false,
  belowTabBar = false,
}: ScreenProps) {
  const theme = useTheme();
  const webTabBarOffset = belowTabBar && Platform.OS === 'web' ? { paddingTop: 68 } : null;

  return (
    <SafeAreaView
      edges={bottomInset ? ['top', 'bottom'] : ['top']}
      style={[styles.screen, { backgroundColor: theme.background }, style]}>
      {/* On tablets and the web the app keeps a phone-like column instead of
          stretching cards across the whole viewport. */}
      <View style={[styles.column, webTabBarOffset]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
});
