import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './ThemeSelector.styles';

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

interface ThemeSelectorViewProps {
  visible: boolean;
  validThemes: [string, Theme][];
  currentTheme: string;
  modalTitle: string;
  modalStyles: {
    overlay: any[];
    content: any[];
  };
  isProcessing: boolean;
  onSelectTheme: (theme: string) => void;
  onClose: () => void;
}

export const ThemeSelectorView: React.FC<ThemeSelectorViewProps> = React.memo(({
  visible,
  validThemes,
  currentTheme,
  modalTitle,
  modalStyles,
  isProcessing,
  onSelectTheme,
  onClose
}) => {
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
        onPress={() => onSelectTheme(key)}
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
  }, [validThemes, currentTheme, isProcessing, onSelectTheme]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={modalStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
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

ThemeSelectorView.displayName = 'ThemeSelectorView';
