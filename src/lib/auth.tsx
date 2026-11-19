import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isSupabaseConfigured, supabase } from './supabase';

interface AuthResult {
  /** Error message in German, or null on success. */
  error: string | null;
  /** True when the account was created but needs e-mail confirmation first. */
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  session: Session | null;
  /** False until the stored session has been read. */
  ready: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function translate(message: string): string {
  const text = message.toLowerCase();
  if (text.includes('invalid login credentials')) {
    return 'E-Mail oder Passwort stimmt nicht.';
  }
  if (text.includes('email not confirmed')) {
    return 'Bitte bestätige zuerst deine E-Mail-Adresse (Link in der Mail).';
  }
  if (text.includes('already registered') || text.includes('already been registered')) {
    return 'Mit dieser E-Mail gibt es schon ein Konto. Bitte melde dich an.';
  }
  if (text.includes('password should be at least') || text.includes('weak password')) {
    return 'Das Passwort ist zu kurz. Bitte mindestens 8 Zeichen verwenden.';
  }
  if (text.includes('valid email') || text.includes('invalid email')) {
    return 'Bitte gib eine gültige E-Mail-Adresse ein.';
  }
  if (text.includes('rate limit') || text.includes('too many')) {
    return 'Zu viele Versuche. Bitte warte einen Moment.';
  }
  if (text.includes('network') || text.includes('failed to fetch')) {
    return 'Keine Verbindung. Bitte prüfe dein Internet.';
  }
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) {
          setSession(data.session);
        }
      })
      .catch(() => {
        // An unreadable stored session just means: not signed in.
      })
      .finally(() => {
        if (active) {
          setReady(true);
        }
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? translate(error.message) : null };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) {
      return { error: translate(error.message) };
    }
    // With e-mail confirmation enabled Supabase returns a user but no session.
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ session, ready, signIn, signUp, signOut }),
    [session, ready, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth muss innerhalb von AuthProvider genutzt werden.');
  }
  return value;
}
