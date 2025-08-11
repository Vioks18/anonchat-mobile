import { THEMES } from './themes';

/**
 * Добавляет прозрачность к hex-цвету
 */
export function withOpacity(hexColor: string, opacity: number): string {
  // Убираем # если есть
  const hex = hexColor.replace('#', '');
  
  // Конвертируем opacity в hex (0-255)
  const alpha = Math.round(opacity * 255);
  const alphaHex = alpha.toString(16).padStart(2, '0');
  
  return `#${hex}${alphaHex}`;
}

/**
 * Вычисляет яркость цвета (0-1)
 */
export function luminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Выбирает подходящий цвет оверлея для фона
 */
export function pickOverlayForBg(backgroundColor: string, theme: 'dark' | 'light' = 'dark'): {
  shadowColor: string;
  glowColor: string;
  overlayColor: string;
} {
  const bgLuminance = luminance(backgroundColor);
  const isLightBg = bgLuminance > 0.5;
  
  // Используем 'dark' как fallback, так как 'light' темы нет в THEMES
  const themeKey = theme === 'light' ? 'dark' : theme;
  
  if (isLightBg) {
    // Для светлого фона - темные тени
    return {
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      glowColor: withOpacity(THEMES[themeKey].accent, 0.4),
      overlayColor: 'rgba(0, 0, 0, 0.05)',
    };
  } else {
    // Для темного фона - светлые тени
    return {
      shadowColor: 'rgba(255, 255, 255, 0.2)',
      glowColor: withOpacity(THEMES[themeKey].accent, 0.6),
      overlayColor: 'rgba(255, 255, 255, 0.05)',
    };
  }
}
