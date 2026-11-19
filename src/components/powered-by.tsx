import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export function PoweredBy() {
  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
        powered by amann one
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  text: {
    fontSize: 12,
    opacity: 0.7,
  },
});
