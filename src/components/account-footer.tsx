import { View, StyleSheet } from 'react-native';

import { PoweredBy } from '@/components/powered-by';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

/** Shows who is signed in, the sign-out button and the footer credit. */
export function AccountFooter() {
  const { session, signOut } = useAuth();

  return (
    <View style={styles.container}>
      {session?.user.email && (
        <ThemedText type="small" themeColor="textSecondary">
          Angemeldet als {session.user.email}
        </ThemedText>
      )}
      <Button label="Abmelden" variant="ghost" onPress={() => void signOut()} />
      <PoweredBy />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
});
