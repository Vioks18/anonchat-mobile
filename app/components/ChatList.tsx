import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Message } from '../types/message';
import { ChatMessage } from './ChatMessage';

interface ChatListProps {
  messages: Message[];
  onSendMessage: () => void;
  onError?: (error: Error) => void;
  themedStyles: any;
  styles: any;
  currentThemeData?: any;
  onScrollToEnd?: () => void;
}

const ChatListInner: React.FC<ChatListProps> = React.memo(({
  messages,
  onSendMessage,
  onError,
  themedStyles,
  styles,
  currentThemeData,
  onScrollToEnd
}) => {
  const [hasError, setHasError] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showReactions, setShowReactions] = useState<string | null>(null);

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

  // Обработчики для ChatMessage
  const handlePress = useCallback((messageId: string) => {
    try {
      setSelectedMessages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(messageId)) {
          newSet.delete(messageId);
        } else {
          newSet.add(messageId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('ChatList: Ошибка обработки нажатия', error);
    }
  }, []);

  const handleLongPress = useCallback((messageId: string) => {
    try {
      setShowReactions(prev => prev === messageId ? null : messageId);
    } catch (error) {
      console.error('ChatList: Ошибка обработки долгого нажатия', error);
    }
  }, []);

  const addReaction = useCallback((messageId: string, reaction: string) => {
    try {
      // Здесь можно добавить логику добавления реакции
      console.log('Добавлена реакция:', reaction, 'к сообщению:', messageId);
      setShowReactions(null);
    } catch (error) {
      console.error('ChatList: Ошибка добавления реакции', error);
    }
  }, []);

  const removeReaction = useCallback((messageId: string) => {
    try {
      // Здесь можно добавить логику удаления реакции
      console.log('Удалена реакция из сообщения:', messageId);
    } catch (error) {
      console.error('ChatList: Ошибка удаления реакции', error);
    }
  }, []);

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

      return (
        <ChatMessage
          item={item}
          handlePress={handlePress}
          handleLongPress={handleLongPress}
          removeReaction={removeReaction}
          addReaction={addReaction}
          showReactions={showReactions}
          selectedMessages={selectedMessages}
          themedStyles={themedStyles}
          styles={styles}
        />
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
  }, [validateMessage, handlePress, handleLongPress, removeReaction, addReaction, showReactions, selectedMessages, themedStyles, styles]);

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
    <View style={[styles.container, themedStyles.safe]}>
      <FlatList {...flatListProps} />
    </View>
  );
});

ChatListInner.displayName = 'ChatList';

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
  bubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 4,
  },
  bubbleContainerOther: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 4,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  bubbleSelected: {
    borderWidth: 2,
    borderColor: '#6c5ce7',
  },
  bubbleSelectedOther: {
    borderWidth: 2,
    borderColor: '#6c5ce7',
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
  statusSending: {
    fontSize: 12,
    color: '#666',
  },
  statusSent: {
    fontSize: 12,
    color: '#666',
  },
  messageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  reaction: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  reactionText: {
    fontSize: 12,
  },
  reactionsPopup: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#23234d',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  reactionsPopupRight: {
    right: 0,
  },
  reactionButton: {
    padding: 8,
    marginHorizontal: 2,
  },
  reactionButtonText: {
    fontSize: 16,
  },
  replyPreview: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyPreviewText: {
    fontSize: 12,
    color: '#ccc',
  },
  errorMessage: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
  },
});

// Экспортируем как default для Expo Router
export default ChatListInner;

// Также экспортируем как named export для обратной совместимости
export const ChatList = ChatListInner;