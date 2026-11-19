import { Image } from 'expo-image';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Elevation, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

type Mode = 'signIn' | 'signUp';

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isSignUp = mode === 'signUp';

  const submit = async () => {
    setError(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setError('Bitte E-Mail und Passwort eingeben.');
      return;
    }
    if (isSignUp && password.length < 8) {
      setError('Das Passwort braucht mindestens 8 Zeichen.');
      return;
    }

    setBusy(true);
    try {
      const result = isSignUp ? await signUp(email, password) : await signIn(email, password);
      if (result.error) {
        setError(result.error);
      } else if (result.needsConfirmation) {
        setInfo('Fast geschafft: Wir haben dir eine E-Mail geschickt. Bestätige sie und melde dich dann an.');
        setMode('signIn');
        setPassword('');
      }
      // On success the auth listener swaps this screen for the app.
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
  ];

  return (
    <Screen bottomInset>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.brand}>
            <Image
              source={require('@/assets/images/brand/visions-logo.png')}
              style={styles.logo}
              contentFit="contain"
              accessibilityLabel="Visions Logo"
            />
            <ThemedText style={[styles.eyebrow, { color: theme.accent }]}>
              DEINE EIGENE BUCKET LIST
            </ThemedText>
            <ThemedText style={styles.title}>{isSignUp ? 'Konto erstellen' : 'Willkommen zurück'}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
              {isSignUp
                ? 'Lege dein Konto an und sammle deine Ziele privat an einem Ort.'
                : 'Melde dich an, um deine Ziele und Erinnerungen zu sehen.'}
            </ThemedText>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              Elevation.card,
            ]}>
            <View style={styles.field}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                E-Mail
              </ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="du@beispiel.de"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                style={inputStyle}
              />
            </View>

            <View style={styles.field}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Passwort
              </ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={isSignUp ? 'Mindestens 8 Zeichen' : 'Dein Passwort'}
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                textContentType={isSignUp ? 'newPassword' : 'password'}
                returnKeyType="go"
                onSubmitEditing={() => void submit()}
                style={inputStyle}
              />
            </View>

            {error && (
              <ThemedText style={[styles.message, { color: theme.accent }]} accessibilityRole="alert">
                {error}
              </ThemedText>
            )}
            {info && <ThemedText style={[styles.message, { color: theme.text }]}>{info}</ThemedText>}

            <Button
              label={isSignUp ? 'Konto erstellen' : 'Anmelden'}
              onPress={() => void submit()}
              loading={busy}
            />
          </View>

          <Button
            label={isSignUp ? 'Schon ein Konto? Anmelden' : 'Noch kein Konto? Registrieren'}
            variant="ghost"
            onPress={() => {
              setMode(isSignUp ? 'signIn' : 'signUp');
              setError(null);
              setInfo(null);
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: Spacing.five,
    gap: Spacing.four,
  },
  brand: {
    gap: 6,
    alignItems: 'flex-start',
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: Spacing.two,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: {
    gap: 6,
  },
  input: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 16,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
});
