export function toInitials(name?: string, username?: string) {
  const src = (name && name.trim()) || (username && username.trim()) || '';
  if (!src) return '??';
  // Split by whitespace / punctuation
  const parts = src.replace(/[_-]+/g, ' ').split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last  = parts.length > 1 ? parts[parts.length - 1][0] : '';
  const raw = (first + last) || src[0] || '?';
  return raw.toUpperCase().slice(0, 2);
}
