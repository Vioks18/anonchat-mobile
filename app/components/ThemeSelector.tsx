import React from 'react';
import { useThemeSelector } from '../hooks/useThemeSelector';
import { ThemeSelectorView } from './ThemeSelectorView';

interface ThemeSelectorProps {
  visible: boolean;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  onClose: () => void;
}

const ThemeSelectorInner: React.FC<ThemeSelectorProps> = React.memo(({
  visible,
  currentTheme,
  onSelectTheme,
  onClose
}) => {
  const {
    validThemes,
    modalTitle,
    modalStyles,
    isProcessing,
    handleThemeSelect,
    handleClose
  } = useThemeSelector({
    visible,
    currentTheme,
    onSelectTheme,
    onClose
  });

  return (
    <ThemeSelectorView
      visible={visible}
      validThemes={validThemes}
      currentTheme={currentTheme}
      modalTitle={modalTitle}
      modalStyles={modalStyles}
      isProcessing={isProcessing}
      onSelectTheme={handleThemeSelect}
      onClose={handleClose}
    />
  );
});

ThemeSelectorInner.displayName = 'ThemeSelector';

// Экспортируем как default для Expo Router
export default ThemeSelectorInner;

// Также экспортируем как named export для обратной совместимости
export const ThemeSelector = ThemeSelectorInner;

// Экспортируем темы
export { THEMES } from '../constants/themes';

