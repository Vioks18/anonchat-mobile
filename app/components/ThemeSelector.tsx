import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

// Темы
const THEMES: Record<string, Theme> = {
  dark: {
    name: "Темная",
    accent: "#6c5ce7",
    bg: "#181825",
    headerBg: "#23234d",
    bubbleMe: "#6c5ce7",
    bubbleOther: "#23234d",
    text: "#fff",
    inputBg: "#23234d",
    border: "#282850",
  },
  ocean: {
    name: "Океан",
    accent: "#00b894",
    bg: "#0a1929",
    headerBg: "#1a3a5f",
    bubbleMe: "#00b894",
    bubbleOther: "#1a3a5f",
    text: "#fff",
    inputBg: "#1a3a5f",
    border: "#2d5a8a",
  },
  sunset: {
    name: "Закат",
    accent: "#e17055",
    bg: "#2d1b1b",
    headerBg: "#4a2c2c",
    bubbleMe: "#e17055",
    bubbleOther: "#4a2c2c",
    text: "#fff",
    inputBg: "#4a2c2c",
    border: "#6b3e3e",
  },
  forest: {
    name: "Лес",
    accent: "#00b894",
    bg: "#0f1a0f",
    headerBg: "#1a3a1a",
    bubbleMe: "#00b894",
    bubbleOther: "#1a3a1a",
    text: "#fff",
    inputBg: "#1a3a1a",
    border: "#2d5a2d",
  },
  purple: {
    name: "Фиолетовая",
    accent: "#a29bfe",
    bg: "#2d1b69",
    headerBg: "#4a2c8a",
    bubbleMe: "#a29bfe",
    bubbleOther: "#4a2c8a",
    text: "#fff",
    inputBg: "#4a2c8a",
    border: "#6b3eb3",
  },
  neon: {
    name: "Неон",
    accent: "#00d2d3",
    bg: "#0a0a0a",
    headerBg: "#1a1a1a",
    bubbleMe: "#00d2d3",
    bubbleOther: "#1a1a1a",
    text: "#fff",
    inputBg: "#1a1a1a",
    border: "#2d2d2d",
  }
};

interface ThemeSelectorProps {
  visible: boolean;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  onClose: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = React.memo(({
  visible,
  currentTheme,
  onSelectTheme,
  onClose
}) => {
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
        styles.modalOverlay,
        isProcessing && { opacity: 0.7 }
      ],
      content: [
        styles.themeModalContent,
        isProcessing && { opacity: 0.8 }
      ]
    };
  }, [isProcessing]);

  // Валидация темы - мемоизирована
  const validateTheme = useCallback((themeKey: string): boolean => {
    try {
      // Проверяем существование темы
      if (!THEMES[themeKey]) {
        console.error('ThemeSelector: Неизвестная тема', themeKey);
        return false;
      }

      // Проверяем структуру темы
      const theme = THEMES[themeKey];
      const requiredFields: (keyof Theme)[] = ['name', 'accent', 'bg', 'headerBg', 'bubbleMe', 'bubbleOther', 'text', 'inputBg', 'border'];
      
      for (const field of requiredFields) {
        if (!theme[field]) {
          console.error(`ThemeSelector: Отсутствует поле ${field} в теме ${themeKey}`);
          return false;
        }
      }

      // Проверяем валидность цветов (базовая проверка)
      const colorFields: (keyof Theme)[] = ['accent', 'bg', 'headerBg', 'bubbleMe', 'bubbleOther', 'text', 'inputBg', 'border'];
      for (const field of colorFields) {
        const color = theme[field];
        if (!color || typeof color !== 'string' || !color.startsWith('#')) {
          console.error(`ThemeSelector: Невалидный цвет ${field} в теме ${themeKey}: ${color}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('ThemeSelector: Ошибка валидации темы', error);
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
        // console.log('ThemeSelector: Тема уже выбрана', themeKey);
        onClose();
        return;
      }

      // Применяем тему
      onSelectTheme(themeKey);
      onClose();

    } catch (error) {
      console.error('ThemeSelector: Ошибка выбора темы', error);
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
      console.error('ThemeSelector: Ошибка закрытия модала', error);
    }
  }, [isProcessing, onClose]);

  // Мемоизированный рендер опций тем
  const themeOptions = useMemo(() => {
    return validThemes.map(([key, theme]) => (
      <TouchableOpacity 
        key={key}
        style={[
          styles.themeOption,
          currentTheme === key && styles.themeOptionSelected,
          isProcessing && styles.themeOptionDisabled
        ]}
        onPress={() => handleThemeSelect(key)}
        activeOpacity={0.7}
        disabled={isProcessing}
      >
        <View style={[styles.themePreview, { backgroundColor: theme.bg }]}>
          <View style={[styles.themePreviewHeader, { backgroundColor: theme.headerBg }]} />
          <View style={[styles.themePreviewBubble, { backgroundColor: theme.bubbleMe }]} />
        </View>
        <Text style={styles.themeOptionText}>{theme.name}</Text>
        {currentTheme === key && (
          <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
        )}
      </TouchableOpacity>
    ));
  }, [validThemes, currentTheme, isProcessing, handleThemeSelect]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={modalStyles.overlay}
        activeOpacity={1}
        onPress={handleClose}
        disabled={isProcessing}
      >
        <TouchableOpacity
          style={modalStyles.content}
          onPress={() => {}}
          activeOpacity={1}
        >
          <Text style={styles.themeModalTitle}>
            {modalTitle}
          </Text>
          {themeOptions}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

ThemeSelector.displayName = 'ThemeSelector';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeModalContent: {
    backgroundColor: '#23234d',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  themeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: "Poppins-Regular",
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#2a2a5a',
  },
  themeOptionSelected: {
    backgroundColor: '#3a3a6a',
    borderWidth: 2,
    borderColor: '#6c5ce7',
  },
  themeOptionDisabled: {
    opacity: 0.5,
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  themePreviewHeader: {
    height: 8,
    width: '100%',
  },
  themePreviewBubble: {
    flex: 1,
    margin: 4,
    borderRadius: 4,
  },
  themeOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: "Poppins-Regular",
  },
});

export { THEMES };

