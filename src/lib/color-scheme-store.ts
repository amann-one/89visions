import { Appearance, Platform } from 'react-native';

export type Scheme = 'light' | 'dark';

const KEY = 'bucketlist.colorScheme';
const listeners = new Set<() => void>();

function readStored(): Scheme {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
    }
  } catch {
    // storage unavailable – fall back to the default
  }
  return 'light';
}

// Light is the default, independent of the device setting.
let current: Scheme = readStored();

function applyNative(scheme: Scheme) {
  if (Platform.OS !== 'web') {
    try {
      Appearance.setColorScheme(scheme);
    } catch {
      // ignore
    }
  }
}
applyNative(current);

export function getScheme(): Scheme {
  return current;
}

export function setScheme(next: Scheme) {
  if (next === current) {
    return;
  }
  current = next;
  applyNative(next);
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(KEY, next);
    }
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener());
}

export function subscribeScheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
