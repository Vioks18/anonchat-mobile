// Small, theme-agnostic palette (tuned for both light/dark).
export const AVATAR_COLORS = [
  '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#14B8A6', '#8B5CF6', '#22C55E', '#EAB308',
  '#F97316', '#06B6D4'
] as const;

export function hashToIndex(seed: string, modulo = AVATAR_COLORS.length) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h % modulo);
}

export function colorFor(seed: string) {
  return AVATAR_COLORS[hashToIndex(seed)];
}
