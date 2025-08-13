import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { InputValidator } from '../utils/validation';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  keyboardHeight: number; // Оставляем для обратной совместимости
  currentThemeData: any;
  inputFocused: boolean;
  setInputFocused: (focused: boolean) => void;
  panelHeight?: number; // Новый проп для высоты панели
  isEmojiPanel?: boolean; // Новый проп для определения типа панели
}

const ChatInputInner: React.FC<ChatInputProps> = React.memo(({
  inputText,
  setInputText,
  onSendMessage,
  keyboardHeight,
  currentThemeData,
  inputFocused,
  setInputFocused,
  panelHeight,
  isEmojiPanel
}) => {
  const textInputRef = useRef<TextInput>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Используем panelHeight если доступен, иначе keyboardHeight
  const effectiveHeight = panelHeight !== undefined ? panelHeight : keyboardHeight;

  // Автоматический скролл к концу текста при изменении
  useEffect(() => {
    if (textInputRef.current && inputText.length > 0) {
      setTimeout(() => {
        textInputRef.current?.setNativeProps({
          selection: { start: inputText.length, end: inputText.length }
        });
      }, 100);
    }
  }, [inputText]);

  // Валидация ввода с новой системой - мемоизирована
  const validateInput = useCallback((text: string): boolean => {
    try {
      // Используем новую систему валидации
      const validationResult = InputValidator.validateMessage(text);
      
      // Проверяем на спам
      const isSpam = InputValidator.checkForSpam(text);
      if (isSpam) {
        setValidationError('Обнаружен спам');
        return false;
      }

      if (!validationResult.isValid) {
        setValidationError(InputValidator.getUserFriendlyError(validationResult));
        return false;
      }

      // Показываем предупреждения
      const warning = InputValidator.getUserFriendlyWarning(validationResult);
      setValidationWarning(warning);
      setValidationError(null);
      
      return true;
    } catch (error) {
      if (__DEV__) console.error('ChatInput: Ошибка валидации', error);
      setValidationError('Ошибка проверки сообщения');
      return false;
    }
  }, []);

  // Безопасная обработка изменения текста - мемоизирована
  const handleTextChange = useCallback((text: string) => {
    try {
      // Санитизируем текст перед установкой
      const sanitizedText = InputValidator.sanitizeText(text);
      setInputText(sanitizedText);
      
      // Очищаем ошибки при вводе
      if (validationError) {
        setValidationError(null);
      }
      if (validationWarning) {
        setValidationWarning(null);
      }
    } catch (error) {
      if (__DEV__) console.error('ChatInput: Ошибка изменения текста', error);
    }
  }, [setInputText, validationError, validationWarning]);

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
      if (__DEV__) console.error('ChatInput: Ошибка отправки сообщения', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  }, [inputText, validateInput, validationError, onSendMessage]);

  // Мемоизированные стили контейнера с поддержкой всех типов панелей
  const containerStyle = useMemo(() => [
    styles.inputContainer, 
    { 
      marginBottom: effectiveHeight, // Используем эффективную высоту
      backgroundColor: currentThemeData.inputBg,
      borderTopColor: currentThemeData.border
    }
  ], [effectiveHeight, currentThemeData.inputBg, currentThemeData.border]);

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
      if (__DEV__) {
        console.log('📱 ChatInput: Фокус установлен, высота панели:', effectiveHeight, 'тип:', isEmojiPanel ? 'эмодзи' : 'клавиатура');
      }
    } catch (error) {
      if (__DEV__) console.error('ChatInput: Ошибка установки фокуса', error);
    }
  }, [setInputFocused, effectiveHeight, isEmojiPanel]);

  const handleBlur = useCallback(() => {
    try {
      setInputFocused(false);
    } catch (error) {
      if (__DEV__) console.error('ChatInput: Ошибка снятия фокуса', error);
    }
  }, [setInputFocused]);

  return (
    <View style={containerStyle}>
      <TextInput
        ref={textInputRef}
        style={textInputStyle}
        value={inputText}
        onChangeText={handleTextChange}
        placeholder="Введите сообщение..."
        placeholderTextColor="#aaa"
        onSubmitEditing={handleSendMessage}
        returnKeyType="send"
        multiline={true}
        blurOnSubmit={false}
        keyboardType="default"
        autoCorrect={true}
        autoCapitalize="sentences"
        onFocus={handleFocus}
        onBlur={handleBlur}
        textAlignVertical="top" // Выравнивание текста сверху
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

ChatInputInner.displayName = 'ChatInput';

// Экспортируем как default для Expo Router
export default ChatInputInner;

// Также экспортируем как named export для обратной совместимости
export const ChatInput = ChatInputInner;

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
    maxHeight: 120, // Ограничиваем высоту чтобы не доходила до верхней панели
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