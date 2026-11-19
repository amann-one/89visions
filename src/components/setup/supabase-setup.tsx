import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabaseConfig } from '@/lib/supabase';

const STEPS = [
  'Lege in Supabase ein Projekt an.',
  'Führe das SQL aus supabase/schema.sql im SQL-Editor aus (Tabelle, Bucket und Policies).',
  'Kopiere Project URL und anon Key unter Project Settings → API in die Datei .env.',
  'Starte den Dev-Server neu (npm start).',
];

const ENV_SNIPPET = `EXPO_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
EXPO_PUBLIC_SUPABASE_BUCKET=${supabaseConfig.bucket}`;

/**
 * Shown instead of the app when the Supabase environment variables are missing.
 * Without them every screen would only produce failed requests.
 */
export function SupabaseSetup() {
  const theme = useTheme();

  return (
    <Screen bottomInset>
      <View style={styles.container}>
        <ThemedText style={styles.emoji}>🔌</ThemedText>
        <ThemedText style={styles.title}>Supabase verbinden</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Bucket List speichert Ziele und Fotos in Supabase. Es fehlen noch die Zugangsdaten.
        </ThemedText>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          {STEPS.map((step, index) => (
            <View key={step} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                <ThemedText style={[styles.stepNumberText, { color: theme.accentContrast }]}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText style={styles.stepText}>{step}</ThemedText>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.codeCard,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <ThemedText style={[styles.codeLabel, { color: theme.textSecondary }]}>
            .env
          </ThemedText>
          <ThemedText style={styles.code}>{ENV_SNIPPET}</ThemedText>
        </View>

        <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
          Danach die App neu laden. Der Dev-Server liest EXPO_PUBLIC_*-Variablen nur beim Start.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Spacing.five,
    gap: Spacing.three,
  },
  emoji: {
    fontSize: 44,
    lineHeight: 52,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
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
  step: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  codeCard: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: 8,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  code: {
    fontSize: 12,
    lineHeight: 19,
    fontFamily: 'monospace',
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
  },
});
