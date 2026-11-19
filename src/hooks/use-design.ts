import { CategoryTones, Gradients, type CategoryTone, type GradientName } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CategoryId } from '@/lib/models';

/** Raw scheme name, for tokens that live outside `Colors`. */
export function useScheme(): 'light' | 'dark' {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

/** All gradients for the active scheme. */
export function useGradients() {
  return Gradients[useScheme()];
}

/** `colors` tuple for one named gradient, ready for `LinearGradient`. */
export function useGradient(name: GradientName) {
  return Gradients[useScheme()][name];
}

/** Accent + soft background for a category. */
export function useCategoryTone(category: CategoryId): CategoryTone {
  const scheme = useScheme();
  return CategoryTones[scheme][category] ?? CategoryTones[scheme].other;
}
