import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Gradient } from '@/components/ui/gradient';
import { Screen } from '@/components/ui/screen';
import { Elevation, Radius, Spacing } from '@/constants/theme';
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
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.orbWrap}>
          <Gradient variant="dusk" style={styles.orb}>
            <ThemedText style={styles.emoji}>🔌</ThemedText>
          </Gradient>
        </View>

        <View style={styles.titleBlock}>
          <ThemedText style={[styles.eyebrow, { color: theme.accent }]}>EINMALIG EINRICHTEN</ThemedText>
          <ThemedText style={styles.title}>Supabase verbinden</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Bucket List speichert Ziele und Fotos in Supabase. Es fehlen noch die Zugangsdaten.
          </ThemedText>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            Elevation.card,
          ]}>
          {STEPS.map((step, index) => (
            <View key={step} style={styles.step}>
              <Gradient variant="sunset" style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
              </Gradient>
              <ThemedText style={styles.stepText}>{step}</ThemedText>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.codeCard,
            { backgroundColor: theme.backgroundElement, borderColor: theme.border },
          ]}>
          <View style={styles.codeHeader}>
            <View style={[styles.codeDot, { backgroundColor: '#FF6B35' }]} />
            <View style={[styles.codeDot, { backgroundColor: '#FFC24B' }]} />
            <View style={[styles.codeDot, { backgroundColor: '#34D399' }]} />
            <ThemedText style={[styles.codeLabel, { color: theme.textSecondary }]}>.env</ThemedText>
          </View>
          <ThemedText style={styles.code}>{ENV_SNIPPET}</ThemedText>
        </View>

        <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
          Danach die App neu laden. Der Dev-Server liest EXPO_PUBLIC_*-Variablen nur beim Start.
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  orbWrap: {
    flexDirection: 'row',
  },
  orb: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 36,
    lineHeight: 44,
  },
  titleBlock: {
    gap: 4,
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
  step: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    color: '#FFFFFF',
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
    gap: 10,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginLeft: 4,
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
