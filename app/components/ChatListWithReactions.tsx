import React, { useCallback, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useMessageStore } from '../hooks/useMessageStore';
import { useReactionState } from '../hooks/useReactionState';
import { Message } from '../types/message';
import MessageWithReactions from './MessageWithReactions';
import ReactionBar from './reactions/ReactionBar';

interface ChatListWithReactionsProps {
  messages: Message[];
  themedStyles: any;
  styles: any;
  currentThemeData?: any;
  onScrollToEnd?: () => void;
  onScrollBeginDrag?: () => void;
}

const ChatListWithReactions: React.FC<ChatListWithReactionsProps> = React.memo(({
  messages,
  themedStyles,
  styles,
  currentThemeData,
  onScrollToEnd,
  onScrollBeginDrag,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [lastTap, setLastTap] = useState<{ messageId: string; timestamp: number } | null>(null);
  
  const { selectedMessages, toggleMessageSelection } = useMessageStore();
  const { selectedMessageId, anchor, visible, close, handleReactionSelect } = useReactionState();

  // Обработчик долгого нажатия для мульти-выбора и реакций
  const handleMessageLongPress = useCallback((messageId: string) => {
    try {
      // Если уже есть выбранные сообщения, то долгое нажатие добавляет к выбору
      const currentSelectedMessages = useMessageStore.getState().selectedMessages;
      if (currentSelectedMessages.length > 0) {
        toggleMessageSelection(messageId);
        return;
      }
      
      // Иначе открываем панель реакций (измерение происходит в MessageWithReactions)
      // Панель уже открыта через openAtMessage в MessageWithReactions
    } catch (error) {
      console.error('ChatListWithReactions: Ошибка открытия панели реакций', error);
    }
  }, [toggleMessageSelection]);

  // Обработчик обычного нажатия для мульти-выбора и двойного клика
  const handleMessagePress = useCallback((messageId: string) => {
    try {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300; // 300ms для двойного клика

      // Если есть активное выделение, то обычное нажатие закрывает его
      if (selectedMessageId) {
        close();
        return;
      }

      // Проверяем двойной клик
      if (lastTap && 
          lastTap.messageId === messageId && 
          now - lastTap.timestamp < DOUBLE_TAP_DELAY) {
        // Двойной клик - открываем панель реакций (измерение происходит в MessageWithReactions)
        const currentSelectedMessages = useMessageStore.getState().selectedMessages;
        if (currentSelectedMessages.length === 0) {
          // Панель откроется через onPress в MessageWithReactions
        }
        setLastTap(null);
        return;
      }

      // Если есть выбранные сообщения, то обычное нажатие переключает выбор
      const currentSelectedMessages = useMessageStore.getState().selectedMessages;
      if (currentSelectedMessages.length > 0) {
        toggleMessageSelection(messageId);
      }

      // Запоминаем первый клик
      setLastTap({ messageId, timestamp: now });
    } catch (error) {
      console.error('ChatListWithReactions: Ошибка переключения выбора', error);
    }
  }, [selectedMessageId, close, toggleMessageSelection, lastTap]);

  // Обработчик скролла - закрываем панель реакций
  const handleScrollBeginDrag = useCallback(() => {
    try {
      close();
      onScrollBeginDrag?.();
    } catch (error) {
      console.error('ChatListWithReactions: Ошибка обработки скролла', error);
    }
  }, [close, onScrollBeginDrag]);

  // Рендер сообщения с реакциями
  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isSelected = selectedMessageId === item.id;

    return (
      <MessageWithReactions
        message={item}
        themedStyles={themedStyles}
        styles={styles}
        currentThemeData={currentThemeData}
        isSelected={isSelected}
        onLongPress={handleMessageLongPress}
        onPress={handleMessagePress}
      />
    );
  }, [selectedMessageId, themedStyles, styles, currentThemeData, handleMessageLongPress, handleMessagePress]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted={true}
        removeClippedSubviews={true}
        windowSize={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        keyboardShouldPersistTaps="handled"
        onScrollToIndexFailed={() => {}}
        onScrollBeginDrag={handleScrollBeginDrag}
        onEndReached={onScrollToEnd}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      
      {/* Панель реакций */}
      {visible && anchor && (
        <ReactionBar
          visible={visible}
          anchor={anchor}
          onClose={close}
          onReactionSelect={handleReactionSelect}
          currentThemeData={currentThemeData}
        />
      )}
    </View>
  );
});

export default ChatListWithReactions;
