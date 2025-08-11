import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { THEMES } from '../constants/themes';

// Тип для темы
interface Theme {
  name: string;
  accent: string;
  bg: string;
  headerBg: string;
  bubbleMe: string;
  bubbleOther: string;
  text: string;
  inputBg: string;
  border: string;
}

interface UseThemeSelectorProps {
  visible: boolean;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  onClose: () => void;
}

export function useThemeSelector({
  visible,
  currentTheme,
  onSelectTheme,
  onClose
}: UseThemeSelectorProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // useMemo для валидных тем - оптимизировано
  const validThemes = useMemo(() => {
    return Object.entries(THEMES).filter(([key, theme]) => {
      // Проверяем обязательные поля
      const requiredFields: (keyof Theme)[] = ['name', 'accent', 'bg', 'headerBg', 'bubbleMe', 'bubbleOther', 'text', 'inputBg', 'border'];
      return requiredFields.every(field => theme[field]);
    });
  }, []);

  // useMemo для заголовка модала - оптимизировано
  const modalTitle = useMemo(() => {
    return isProcessing ? 'Применение темы...' : 'Выберите тему';
  }, [isProcessing]);

  // useMemo для стилей модала - оптимизировано
  const modalStyles = useMemo(() => {
    return {
      overlay: [
        { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
        isProcessing && { opacity: 0.7 }
      ],
      content: [
        { backgroundColor: '#23234d', borderRadius: 16, padding: 20, width: '80%', maxHeight: '70%' },
        isProcessing && { opacity: 0.8 }
      ]
    };
  }, [isProcessing]);

  // Валидация темы - мемоизирована
  const validateTheme = useCallback((themeKey: string): boolean => {
    try {
      // Проверяем существование темы
      if (!THEMES[themeKey]) {
        if (__DEV__) console.error('ThemeSelector: Неизвестная тема', themeKey);
        return false;
      }

      // Проверяем структуру темы
      const theme = THEMES[themeKey];
      const requiredFields: (keyof Theme)[] = ['name', 'accent', 'bg', 'headerBg', 'bubbleMe', 'bubbleOther', 'text', 'inputBg', 'border'];
      
      for (const field of requiredFields) {
        if (!theme[field]) {
          if (__DEV__) console.error(`ThemeSelector: Отсутствует поле ${field} в теме ${themeKey}`);
          return false;
        }
      }

      // Проверяем валидность цветов (базовая проверка)
      const colorFields: (keyof Theme)[] = ['accent', 'bg', 'headerBg', 'bubbleMe', 'bubbleOther', 'text', 'inputBg', 'border'];
      for (const field of colorFields) {
        const color = theme[field];
        if (!color || typeof color !== 'string' || !color.startsWith('#')) {
          if (__DEV__) console.error(`ThemeSelector: Невалидный цвет ${field} в теме ${themeKey}: ${color}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      if (__DEV__) console.error('ThemeSelector: Ошибка валидации темы', error);
      return false;
    }
  }, []);

  // Безопасная обработка выбора темы - мемоизирована
  const handleThemeSelect = useCallback(async (themeKey: string) => {
    try {
      setIsProcessing(true);

      // Валидируем тему
      if (!validateTheme(themeKey)) {
        Alert.alert(
          'Ошибка темы',
          'Выбранная тема содержит ошибки',
          [{ text: 'OK' }]
        );
        return;
      }

      // Проверяем, что тема изменилась
      if (themeKey === currentTheme) {
        onClose();
        return;
      }

      // Применяем тему
      onSelectTheme(themeKey);
      onClose();

    } catch (error) {
      if (__DEV__) console.error('ThemeSelector: Ошибка выбора темы', error);
      Alert.alert('Ошибка', 'Не удалось применить тему');
    } finally {
      setIsProcessing(false);
    }
  }, [validateTheme, currentTheme, onSelectTheme, onClose]);

  // Безопасное закрытие модала - мемоизировано
  const handleClose = useCallback(() => {
    try {
      if (isProcessing) {
        return; // Не закрываем во время обработки
      }
      onClose();
    } catch (error) {
      if (__DEV__) console.error('ThemeSelector: Ошибка закрытия модала', error);
    }
  }, [isProcessing, onClose]);

  return {
    validThemes,
    modalTitle,
    modalStyles,
    isProcessing,
    handleThemeSelect,
    handleClose
  };
}
