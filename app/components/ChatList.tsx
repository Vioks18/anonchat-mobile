import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: number;
  status?: "sending" | "sent" | "error";
}

interface ChatListProps {
  messages: Message[];
  currentThemeData: any;
  onScrollToEnd?: () => void;
}

export const ChatList: React.FC<ChatListProps> = React.memo(({
  messages,
  currentThemeData,
  onScrollToEnd
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [hasError, setHasError] = useState(false);

  // Валидация сообщения - мемоизирована
  const validateMessage = useCallback((message: Message): boolean => {
    try {
      // Проверяем обязательные поля
      if (!message.id || typeof message.id !== 'string') {
        console.error('ChatList: Невалидный ID сообщения', message);
        return false;
      }

      if (!message.text || typeof message.text !== 'string') {
        console.error('ChatList: Невалидный текст сообщения', message);
        return false;
      }

      if (!message.sender || !['me', 'other'].includes(message.sender)) {
        console.error('ChatList: Невалидный отправитель', message);
        return false;
      }

      if (!message.timestamp || typeof message.timestamp !== 'number') {
        console.error('ChatList: Невалидная временная метка', message);
        return false;
      }

      // Проверяем длину текста
      if (message.text.length > 1000) {
        console.error('ChatList: Слишком длинное сообщение', message.text.length);
        return false;
      }

      // Проверяем на пустой текст
      if (message.text.trim().length === 0) {
        console.error('ChatList: Пустое сообщение');
        return false;
      }

      return true;
    } catch (error) {
      console.error('ChatList: Ошибка валидации сообщения', error);
      return false;
    }
  }, []);

  // Валидация массива сообщений - мемоизирована
  const validateMessages = useCallback((messagesArray: Message[]): Message[] => {
    try {
      if (!Array.isArray(messagesArray)) {
        console.error('ChatList: messages не является массивом');
        return [];
      }

      const validMessages = messagesArray.filter(message => {
        const isValid = validateMessage(message);
        if (!isValid) {
          console.warn('ChatList: Пропущено невалидное сообщение', message.id);
        }
        return isValid;
      });

      // Проверяем дубликаты ID
      const seenIds = new Set<string>();
      const uniqueMessages = validMessages.filter(message => {
        if (seenIds.has(message.id)) {
          console.warn('ChatList: Дубликат ID сообщения', message.id);
          return false;
        }
        seenIds.add(message.id);
        return true;
      });

      return uniqueMessages;
    } catch (error) {
      console.error('ChatList: Ошибка валидации массива сообщений', error);
      return [];
    }
  }, [validateMessage]);

  // Безопасный рендер сообщения - мемоизирован
  const renderMessage = useCallback(({ item }: { item: Message }) => {
    try {
      // Валидируем сообщение перед рендером
      if (!validateMessage(item)) {
        return (
          <View style={styles.errorMessage}>
            <Text style={styles.errorText}>Невалидное сообщение</Text>
          </View>
        );
      }

      const isMe = item.sender === "me";
      
      return (
        <View style={[styles.messageContainer, isMe ? styles.messageMe : styles.messageOther]}>
          <View style={[
            styles.bubble, 
            isMe 
              ? { ...styles.bubbleMe, backgroundColor: currentThemeData.bubbleMe }
              : { ...styles.bubbleOther, backgroundColor: currentThemeData.bubbleOther }
          ]}>
            <Text style={[styles.messageText, { color: currentThemeData.text }]}>{item.text}</Text>
            {item.status && (
              <Text style={[styles.statusText, { color: currentThemeData.text }]}>
                {item.status === 'sending' ? '⏳' : item.status === 'sent' ? '✓' : '✗'}
              </Text>
            )}
          </View>
        </View>
      );
    } catch (error) {
      console.error('ChatList: Error rendering message', error);
      setHasError(true);
      return (
        <View style={styles.errorMessage}>
          <Text style={styles.errorText}>Ошибка отображения сообщения</Text>
        </View>
      );
    }
  }, [currentThemeData, validateMessage]);

  // Безопасная обработка ошибок FlatList - мемоизирована
  const handleError = useCallback((error: any) => {
    console.error('ChatList: FlatList error', error);
    setHasError(true);
  }, []);

  // Безопасная обработка layout - мемоизирована
  const handleLayout = useCallback(() => {
    try {
      // Можно добавить дополнительную логику при изменении layout
    } catch (error) {
      console.error('ChatList: Layout error', error);
    }
  }, []);

  // Валидируем сообщения - мемоизировано
  const validMessages = useMemo(() => validateMessages(messages), [messages, validateMessages]);

  // Мемоизированные пропсы для FlatList
  const flatListProps = useMemo(() => ({
    data: validMessages,
    renderItem: renderMessage,
    keyExtractor: (item: Message) => item.id,
    style: styles.messagesList,
    showsVerticalScrollIndicator: false,
    keyboardShouldPersistTaps: "handled" as const,
    removeClippedSubviews: true,
    maxToRenderPerBatch: 10,
    windowSize: 10,
    initialNumToRender: 10,
    inverted: true,
    onLayout: handleLayout,
    onEndReached: onScrollToEnd,
    onEndReachedThreshold: 0.1,
    onError: handleError,
  }), [validMessages, renderMessage, handleLayout, onScrollToEnd, handleError]);

  // Показываем предупреждение если есть ошибки
  if (hasError) {
    Alert.alert(
      'Предупреждение',
      'Обнаружены ошибки в отображении сообщений',
      [{ text: 'OK', onPress: () => setHasError(false) }]
    );
  }

  return (
    <View style={styles.container}>
      {validMessages.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: currentThemeData.text }]}>
            Нет сообщений
          </Text>
        </View>
      )}
      <FlatList {...flatListProps} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  messageMe: {
    justifyContent: 'flex-end',
  },
  messageOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  errorMessage: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
  },
}); 