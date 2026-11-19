import { useSyncExternalStore } from 'react';

import { getScheme, subscribeScheme, type Scheme } from '@/lib/color-scheme-store';

export function useColorScheme(): Scheme {
  return useSyncExternalStore(subscribeScheme, getScheme, getScheme);
}
