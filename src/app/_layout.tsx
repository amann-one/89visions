import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import '@/global.css';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { session, ready } = useAuth();

  if (!ready) {
    return null;
  }

  const signedIn = isSupabaseConfigured && Boolean(session);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={signedIn}>
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
        <Stack.Protected guard={isSupabaseConfigured && !session}>
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Protected guard={!isSupabaseConfigured}>
          <Stack.Screen name="setup" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
