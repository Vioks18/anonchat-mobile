import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { BackHandler, FlatList, View } from 'react-native';
import { Portal } from 'react-native-portalize';
import { useMessageStore } from '../hooks/useMessageStore';
import useReactionState from '../hooks/useReactionState';
import { Message } from '../types/message';
import MessageWithReactions from './MessageWithReactions';
import { ReactionBar } from './reactions';

interface ChatListWithReactionsProps {
  messages: Message[];
  onScrollBeginDrag?: () => void;
  onMessageSelected?: (messageId: string | null) => void;
  onSelectionChange?: (selectedCount: number) => void;
  onSelectedMessagesChange?: (selectedMessages: Set<string>) => void;
}

const ChatListWithReactions: React.FC<ChatListWithReactionsProps> = ({
  messages,
  onScrollBeginDrag,
  onMessageSelected,
  onSelectionChange,
  onSelectedMessagesChange,
}) => {
  const { selectedMessageId, anchor, visible, openAtMessage, close, setLastTouch, keyboardHeight } = useReactionState();
  const messageRefs = useRef(new Map<string, any>());
  const scrollingRef = useRef<boolean>(false);
  
  // Используем store для выбора
  const selectedIds = useMessageStore(s => s.selectedIds);
  const enterSelection = useMessageStore(s => s.enterSelection);
  const toggleSelection = useMessageStore(s => s.toggleSelection);
  const clearSelection = useMessageStore(s => s.clearSelection);
  const isMessageSelected = useMessageStore(s => s.isSelected);
  const getSelectedCount = useMessageStore(s => s.getSelectedCount);
  
  const isSelectionMode = selectedIds.size > 0;
  
  // Стабильное extraData для перерисовки
  const extraData = useMemo(
    () => `${messages.length}:${Array.from(selectedIds).sort().join('|')}`,
    [messages.length, selectedIds]
  );
  
  // Версия сообщений для отслеживания новых сообщений
  const messagesVersion = useMemo(() => messages.map(m => m.id).join(','), [messages]);

  // Очистка refs для удаленных сообщений
  useEffect(() => {
    const ids = new Set(messages.map(m => m.id));
    for (const k of Array.from(messageRefs.current.keys())) {
      if (!ids.has(k)) messageRefs.current.delete(k);
    }
  }, [messagesVersion]);

  // Long press: вход в режим выбора или toggle в режиме выбора
  const handleLongPress = useCallback((id: string, event?: any) => {
    
    const currentCount = getSelectedCount();
    
    if (currentCount === 0) {
      // Вход в режим выбора
      enterSelection(id);
      
      // Открываем реакции только сейчас
      setLastTouch?.(event?.nativeEvent?.pageX, event?.nativeEvent?.pageY);
      const ref = messageRefs.current.get(id);
      if (ref) {
        requestAnimationFrame(() => openAtMessage(id, ref)); // показать реакции
      }
    } else {
      // В режиме выбора - просто toggle
      toggleSelection(id);
      close(); // Закрываем реакции если были открыты
    }
  }, [getSelectedCount, enterSelection, toggleSelection, setLastTouch, openAtMessage, close]);

  // Tap: в режиме выбора - toggle, иначе - ничего
  const handlePress = useCallback((id: string) => {
    
    const currentCount = getSelectedCount();
    
    if (currentCount > 0) {
      // В режиме выбора - toggle выделения
      toggleSelection(id);
    }
    // В обычном режиме - ничего не делаем
  }, [getSelectedCount, toggleSelection]);

  // Эффекты для управления реакциями и выбором
  useEffect(() => {
    // Уведомляем родительский компонент
    onSelectionChange?.(getSelectedCount());
    onSelectedMessagesChange?.(selectedIds);
  }, [selectedIds, getSelectedCount, onSelectionChange, onSelectedMessagesChange]);

  useEffect(() => {
    // Если выбрано больше одного - закрываем реакции
    if (getSelectedCount() > 1) {
      close();
    }
    // Если ничего не выбрано - закрываем реакции и сбрасываем выбор
    if (getSelectedCount() === 0) {
      close();
      onMessageSelected?.(null);
    }
  }, [getSelectedCount, close, onMessageSelected]);

  // Управление реакциями при изменении выбора
  useEffect(() => {
    const currentCount = getSelectedCount();
    if (currentCount !== 1) {
      close(); // >1 или 0 — прячем панель
    }
  }, [getSelectedCount, close]);

  // Back handler для Android
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isSelectionMode) {
        clearSelection();
        return true; // Предотвращаем закрытие приложения
      }
      return false; // Позволяем обычное поведение back
    });

    return () => subscription.remove();
  }, [isSelectionMode, clearSelection]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    
    const isMyMessage = item.sender === 'me';
    const isSelected = isMessageSelected(item.id);

    return (
      <MessageWithReactions
        message={item}
        isMyMessage={isMyMessage}
        isSelected={isSelected}
        onLongPress={handleLongPress}
        onPress={handlePress}
        registerRef={(id, ref) => {
          if (ref) messageRefs.current.set(id, ref);
        }}
      />
    );
  }, [handleLongPress, handlePress, isMessageSelected]);

  const handleScrollBeginDrag = useCallback(() => {
    
    scrollingRef.current = true;
    // Закрываем только реакции, выбор не сбрасываем
    close();
    onScrollBeginDrag?.();
  }, [close, onScrollBeginDrag]);

  const handleScrollEndDrag = useCallback(() => {
    
    setTimeout(() => {
      scrollingRef.current = false;
    }, 100);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        extraData={extraData}
        inverted={true}
        removeClippedSubviews={true}
        windowSize={10}
        maxToRenderPerBatch={10}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
      />
      
      <Portal>
        <ReactionBar
          visible={!!(visible && getSelectedCount() === 1 && selectedMessageId && isMessageSelected(selectedMessageId))}
          anchor={anchor}
          onClose={close}
          selectedMessageId={selectedMessageId}
          keyboardHeight={keyboardHeight}
        />
      </Portal>
    </View>
  );
};

export default ChatListWithReactions;
