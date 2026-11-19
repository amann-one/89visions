import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { isSupabaseConfigured } from '@/lib/supabase';
import '@/global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isSupabaseConfigured}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="item/[id]" />
          <Stack.Screen
            name="edit"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!isSupabaseConfigured}>
          <Stack.Screen name="setup" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
