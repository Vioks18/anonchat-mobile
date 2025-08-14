import { Image } from 'expo-image';

export async function prefetchOne(url: string) {
  try {
    await Image.prefetch(url); // low priority
  } catch {}
}

export async function prefetchMany(urls: string[], cap = 24) {
  const slice = urls.filter(Boolean).slice(0, cap);
  await Promise.all(slice.map((u) => prefetchOne(u)));
}
