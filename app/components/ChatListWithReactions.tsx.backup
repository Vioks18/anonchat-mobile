import React, { useCallback, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Portal } from 'react-native-portalize';
import useReactionState from '../hooks/useReactionState';
import { Message } from '../types/message';
import MessageWithReactions from './MessageWithReactions';
import { ReactionBar } from './reactions';

interface ChatListWithReactionsProps {
  messages: Message[];
  onScrollBeginDrag?: () => void;
  onMessageSelected?: (messageId: string | null) => void;
}

const ChatListWithReactions: React.FC<ChatListWithReactionsProps> = ({
  messages,
  onScrollBeginDrag,
  onMessageSelected,
}) => {
  const { selectedMessageId, anchor, visible, openAtMessage, close, setLastTouch, keyboardHeight } = useReactionState();
  const messageRefs = useRef(new Map<string, any>());
  const scrollingRef = useRef<boolean>(false);
  const [lastTap, setLastTap] = useState<{ messageId: string; t: number } | null>(null);
  const [showHeaderActions, setShowHeaderActions] = useState(false);
  const [localSelectedMessageId, setLocalSelectedMessageId] = useState<string | null>(null);

  const registerMessageRef = useCallback((id: string, ref: any) => {
    if (ref && id) {
      messageRefs.current.set(id, ref);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (__DEV__) {
      console.log('🔥 ChatList: handleClose - закрываем оба меню одновременно');
    }
    // Закрываем оба меню одновременно
    setTimeout(() => {
      setShowHeaderActions(false);
      setLocalSelectedMessageId(null);
      onMessageSelected?.(null);
      close();
    }, 0);
  }, [close, onMessageSelected]);

  const handleLongPress = useCallback((id: string, e?: any) => {
    if (scrollingRef.current) return;
    setLocalSelectedMessageId(id);
    setShowHeaderActions(true);
    onMessageSelected?.(id); // Показываем кнопки в header при long-press
    close(); // на long-press реакции НЕ открываем
    setLastTap(null); // Сбрасываем двойной тап при long-press
  }, [close, onMessageSelected]);

  const handlePress = useCallback((id: string, e?: any) => {
    const now = Date.now();
    const WIN = 260;
    
    // Проверяем флаг closeAll - если есть, закрываем все меню сразу
    if (e?.closeAll) {
      handleClose();
      setLastTap(null);
      return;
    }
    
    // Если сообщение уже выделено удержанием - просто убираем выделение
    if (localSelectedMessageId === id && showHeaderActions) {
      setLocalSelectedMessageId(null);
      setShowHeaderActions(false);
      onMessageSelected?.(null);
      setLastTap(null);
      return;
    }
    
    if (lastTap && lastTap.messageId === id && (now - lastTap.t) < WIN) {
      // double-tap → ОТКРЫТЬ РЕАКЦИИ + ПОКАЗАТЬ КНОПКИ В HEADER
      setShowHeaderActions(true);
      setLocalSelectedMessageId(id);
      onMessageSelected?.(id); // Показываем кнопки в header при double-tap
      setLastTouch?.(e?.nativeEvent?.pageX, e?.nativeEvent?.pageY);
      const ref = messageRefs.current.get(id);
      if (ref) openAtMessage(id, ref);
      setLastTap(null);
      return;
    }
    
    // Обычный тап → закрываем реакции если они открыты
    if (visible) {
      close();
      setLocalSelectedMessageId(null);
      onMessageSelected?.(null);
    }
    
    setLastTap({ messageId: id, t: now });
  }, [lastTap, openAtMessage, setLastTouch, onMessageSelected, visible, close, localSelectedMessageId, showHeaderActions, handleClose]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isMyMessage = item.sender === 'me';
    const isSelected = localSelectedMessageId === item.id;

    return (
      <MessageWithReactions
        message={item}
        isMyMessage={isMyMessage}
        isSelected={isSelected}
        onLongPress={handleLongPress}
        onPress={handlePress}
        registerRef={registerMessageRef}
      />
    );
  }, [localSelectedMessageId, handleLongPress, handlePress, registerMessageRef]);

  const handleScrollBeginDrag = useCallback(() => {
    scrollingRef.current = true;
    handleClose();
    onScrollBeginDrag?.();
  }, [handleClose, onScrollBeginDrag]);

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
        inverted={true}
        removeClippedSubviews={true}
        windowSize={10}
        maxToRenderPerBatch={10}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
      />
      
      <Portal>
                 <ReactionBar
           visible={visible}
           anchor={anchor}
           onClose={handleClose}
           selectedMessageId={localSelectedMessageId}
           keyboardHeight={keyboardHeight}
         />
      </Portal>
    </View>
  );
};

export default ChatListWithReactions;
