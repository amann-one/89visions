import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

function readEnv(value: string | undefined): string {
  return value?.trim() ?? '';
}

export const supabaseConfig = {
  url: readEnv(process.env.EXPO_PUBLIC_SUPABASE_URL).replace(/\/$/, ''),
  anonKey: readEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  bucket: readEnv(process.env.EXPO_PUBLIC_SUPABASE_BUCKET) || 'bucket-list',
};

export const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

// During static rendering on the web there is no window; keep storage off there.
const canPersist = Platform.OS !== 'web' || typeof window !== 'undefined';

/**
 * A single shared client for auth, database and storage.
 *
 * Every user signs in with e-mail and password. The session is persisted and
 * refreshed automatically, and the RLS policies in `supabase/schema.sql`
 * restrict every row and file to its owner.
 */
export const supabase = createClient(
  supabaseConfig.url || 'https://placeholder.supabase.co',
  supabaseConfig.anonKey || 'public-anon-key',
  {
    auth: {
      storage: canPersist ? AsyncStorage : undefined,
      persistSession: canPersist,
      autoRefreshToken: true,
      detectSessionInUrl: Platform.OS === 'web' && canPersist,
    },
  }
);
