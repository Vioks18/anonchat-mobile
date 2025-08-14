export function getThemeVersion(theme: any) {
  // derive a simple hash from a few colors to detect change without deep compare
  const k = [theme.background, theme.card, theme.text, theme.muted].join('|');
  let h = 0; for (let i=0;i<k.length;i++) h = (h*31 + k.charCodeAt(i))|0;
  return h >>> 0;
}
