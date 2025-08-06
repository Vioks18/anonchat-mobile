import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface MessageInputProps {
  input: string;
  setInput: (text: string) => void;
  sendMessage: () => void;
  isSending: boolean;
  keyboardHeight: number;
  themedStyles: any;
  styles: any;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  input,
  setInput,
  sendMessage,
  isSending,
  keyboardHeight,
  themedStyles,
  styles,
}) => {
  // Безопасная обработка изменения текста
  const handleTextChange = useCallback((text: string) => {
    try {
      if (typeof text === 'string') {
        setInput(text);
      } else {
        console.warn('MessageInput: Невалидный тип текста', typeof text);
      }
    } catch (error) {
      console.error('MessageInput: Ошибка изменения текста', error);
    }
  }, [setInput]);

  // Безопасная обработка отправки
  const handleSendMessage = useCallback(() => {
    try {
      sendMessage();
    } catch (error) {
      console.error('MessageInput: Ошибка отправки сообщения', error);
    }
  }, [sendMessage]);

  // Безопасная обработка отправки по Enter
  const handleSubmitEditing = useCallback(() => {
    try {
      if (input.trim() !== "" && !isSending) {
        sendMessage();
      }
    } catch (error) {
      console.error('MessageInput: Ошибка отправки по Enter', error);
    }
  }, [input, isSending, sendMessage]);

  try {
    return (
      <View style={themedStyles.inputContainer}>
        <TextInput
          style={themedStyles.input}
          value={input}
          onChangeText={handleTextChange}
          placeholder="Введите сообщение..."
          placeholderTextColor="#aaa"
          onSubmitEditing={handleSubmitEditing}
          returnKeyType="send"
          multiline={true}
          maxLength={1000}
          blurOnSubmit={false}
          keyboardType="default"
          autoCorrect={true}
          autoCapitalize="sentences"
        />
        <TouchableOpacity
          style={[
            themedStyles.sendButton, 
            isSending && styles.sendButtonDisabled,
            input.trim() === "" && styles.sendButtonInactive
          ]}
          activeOpacity={0.7}
          onPress={handleSendMessage}
          disabled={isSending || input.trim() === ""}
        >
          <Ionicons name="send-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  } catch (error) {
    console.error('MessageInput: Ошибка рендеринга', error);
    return null;
  }
}; 