import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  keyboardHeight: number;
  currentThemeData: any;
  inputFocused: boolean;
  setInputFocused: (focused: boolean) => void;
}

export const ChatInput: React.FC<ChatInputProps> = React.memo(({
  inputText,
  setInputText,
  onSendMessage,
  keyboardHeight,
  currentThemeData,
  inputFocused,
  setInputFocused
}) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  // Валидация ввода - мемоизирована
  const validateInput = useCallback((text: string): boolean => {
    try {
      // Проверка длины
      if (text.length > 1000) {
        setValidationError('Сообщение слишком длинное (максимум 1000 символов)');
        return false;
      }

      // Проверка на спам (повторяющиеся символы)
      const spamPattern = /(.)\1{10,}/;
      if (spamPattern.test(text)) {
        setValidationError('Обнаружен спам (слишком много повторяющихся символов)');
        return false;
      }

      // Проверка на пустые строки
      if (text.trim().length === 0) {
        setValidationError('Сообщение не может быть пустым');
        return false;
      }

      // Проверка на специальные символы (опционально)
      const specialCharsPattern = /[<>{}]/;
      if (specialCharsPattern.test(text)) {
        setValidationError('Сообщение содержит недопустимые символы');
        return false;
      }

      setValidationError(null);
      return true;
    } catch (error) {
      console.error('ChatInput: Ошибка валидации', error);
      setValidationError('Ошибка проверки сообщения');
      return false;
    }
  }, []);

  // Безопасная обработка изменения текста - мемоизирована
  const handleTextChange = useCallback((text: string) => {
    try {
      setInputText(text);
      
      // Очищаем ошибку при вводе
      if (validationError) {
        setValidationError(null);
      }
    } catch (error) {
      console.error('ChatInput: Ошибка изменения текста', error);
    }
  }, [setInputText, validationError]);

  // Безопасная обработка отправки - мемоизирована
  const handleSendMessage = useCallback(() => {
    try {
      const trimmedText = inputText.trim();
      
      if (!validateInput(trimmedText)) {
        // Показываем ошибку пользователю
        Alert.alert(
          'Ошибка валидации',
          validationError || 'Сообщение не прошло проверку',
          [{ text: 'OK' }]
        );
        return;
      }

      onSendMessage();
    } catch (error) {
      console.error('ChatInput: Ошибка отправки сообщения', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  }, [inputText, validateInput, validationError, onSendMessage]);

  // Мемоизированные стили контейнера
  const containerStyle = useMemo(() => [
    styles.inputContainer, 
    { 
      marginBottom: keyboardHeight,
      backgroundColor: currentThemeData.inputBg,
      borderTopColor: currentThemeData.border
    }
  ], [keyboardHeight, currentThemeData.inputBg, currentThemeData.border]);

  // Мемоизированные стили текстового поля
  const textInputStyle = useMemo(() => [
    styles.textInput,
    { 
      backgroundColor: currentThemeData.inputBg,
      color: currentThemeData.text,
      borderColor: validationError ? '#ff4444' : currentThemeData.border
    }
  ], [currentThemeData.inputBg, currentThemeData.text, currentThemeData.border, validationError]);

  // Мемоизированные стили кнопки отправки
  const sendButtonStyle = useMemo(() => [
    styles.sendButton, 
    { backgroundColor: currentThemeData.accent },
    (!inputText.trim() || validationError) && styles.sendButtonDisabled
  ], [currentThemeData.accent, inputText, validationError]);

  // Мемоизированные обработчики фокуса
  const handleFocus = useCallback(() => {
    try {
      setInputFocused(true);
    } catch (error) {
      console.error('ChatInput: Ошибка установки фокуса', error);
    }
  }, [setInputFocused]);

  const handleBlur = useCallback(() => {
    try {
      setInputFocused(false);
    } catch (error) {
      console.error('ChatInput: Ошибка снятия фокуса', error);
    }
  }, [setInputFocused]);

  return (
    <View style={containerStyle}>
      <TextInput
        style={textInputStyle}
        value={inputText}
        onChangeText={handleTextChange}
        placeholder="Введите сообщение..."
        placeholderTextColor="#aaa"
        onSubmitEditing={handleSendMessage}
        returnKeyType="send"
        multiline={true}
        maxLength={1000}
        blurOnSubmit={false}
        keyboardType="default"
        autoCorrect={true}
        autoCapitalize="sentences"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <TouchableOpacity
        style={sendButtonStyle}
        onPress={handleSendMessage}
        disabled={!inputText.trim() || !!validationError}
        activeOpacity={0.7}
      >
        <Ionicons name="send-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
});

ChatInput.displayName = 'ChatInput';

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    minHeight: 60,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 