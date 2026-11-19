import { useSyncExternalStore } from 'react';

import { getScheme, subscribeScheme, type Scheme } from '@/lib/color-scheme-store';

/** Static rendering always starts light; the client picks up the stored choice. */
export function useColorScheme(): Scheme {
  return useSyncExternalStore(subscribeScheme, getScheme, () => 'light');
}
