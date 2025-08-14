// If ChatList items provide tiny base64 thumbnail (e.g., item.avatarThumbBase64),
// use it as placeholder for expo-image. If not, synthesize a single-color 1x1 PNG.

export function toDataUri(base64?: string) {
  if (!base64) return undefined;
  if (base64.startsWith('data:')) return base64;
  return `data:image/png;base64,${base64}`;
}

// Build a 1x1 PNG data URI from a hex color (fallback).
export function solidColorDataUri(hex: string) {
  // Tiny 1x1 PNG header; simplest is to pre-bake a few neutral variants.
  // For minimal footprint, return undefined if you prefer gradient placeholder only.
  return undefined; // keep simple; Avatar will use gradient layer if undefined
}
