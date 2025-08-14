import { create } from 'zustand';

type UiPerfState = {
  reducedMotion: boolean;      // from AccessibilityInfo
  themeVersion: number;        // increment on theme change (external setter)
  bumpThemeVersion(): void;
  setReducedMotion(v:boolean): void;
};

export const useUiPerfStore = create<UiPerfState>((set)=>({
  reducedMotion: false,
  themeVersion: 0,
  bumpThemeVersion: () => set(s=>({themeVersion: s.themeVersion+1})),
  setReducedMotion: (v) => set({reducedMotion: v}),
}));
