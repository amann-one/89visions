import { type ReactNode } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

interface ScreenProps {
  children: ReactNode;
  style?: ViewStyle;
  /** Use `bottom` for screens that are not inside the native tab bar. */
  bottomInset?: boolean;
}

export function Screen({ children, style, bottomInset = false }: ScreenProps) {
  const theme = useTheme();
  return (
    <SafeAreaView
      edges={bottomInset ? ['top', 'bottom'] : ['top']}
      style={[styles.screen, { backgroundColor: theme.background }, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
