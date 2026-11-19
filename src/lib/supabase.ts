import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

function readEnv(value: string | undefined): string {
  return value?.trim() ?? '';
}

export const supabaseConfig = {
  url: readEnv(process.env.EXPO_PUBLIC_SUPABASE_URL).replace(/\/$/, ''),
  anonKey: readEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  bucket: readEnv(process.env.EXPO_PUBLIC_SUPABASE_BUCKET) || 'bucket-list',
};

export const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

/**
 * A single shared client for database and storage.
 *
 * There is no auth flow yet, so sessions are disabled and every request runs
 * with the public anon key. That is why the RLS policies in
 * `supabase/schema.sql` are intentionally permissive – fine for a personal
 * list, not for a multi-tenant app.
 */
export const supabase = createClient(
  supabaseConfig.url || 'https://placeholder.supabase.co',
  supabaseConfig.anonKey || 'public-anon-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);
