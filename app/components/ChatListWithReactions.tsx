import React, { useCallback, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Portal } from 'react-native-portalize';
import useReactionState from '../hooks/useReactionState';
import { Message } from '../types/message';
import { GestureProbe } from '../utils/gestureProbe';
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
      if (__DEV__) {
        console.log('🔥 registerMessageRef:', { id, refFound: !!ref, totalRefs: messageRefs.current.size });
      }
    }
  }, []);

  const handleClose = useCallback(() => {
    if (__DEV__) {
      if (__DEV__) console.log('🔥 ChatList: handleClose - закрываем оба меню одновременно');
    }
    // Закрываем оба меню одновременно без задержки
    setShowHeaderActions(false);
    setLocalSelectedMessageId(null);
    onMessageSelected?.(null);
    close();
  }, [close, onMessageSelected]);

  const handleLongPress = useCallback((id: string, e?: any) => {
    if (scrollingRef.current) return;
    if (__DEV__) {
      GestureProbe.log({ type: 'longPress', t: Date.now(), msgId: id });
    }
    setLocalSelectedMessageId(id);
    setShowHeaderActions(true);
    onMessageSelected?.(id); // Показываем кнопки в header при long-press
    close(); // на long-press реакции НЕ открываем
    setLastTap(null); // Сбрасываем двойной тап при long-press
  }, [close, onMessageSelected]);

  const handlePress = useCallback((id: string, e?: any) => {
    const now = Date.now();
    const WIN = 300; // Окно двойного тапа
    
    if (__DEV__) {
      console.log('🔥 handlePress:', { 
        id, 
        lastTap, 
        timeDiff: lastTap ? now - lastTap.t : null,
        visible,
        showHeaderActions,
        scrolling: scrollingRef.current
      });
    }
    
    // Если есть открытое меню - закрываем его
    if (visible || showHeaderActions) {
      if (__DEV__) {
        console.log('🔥 Закрываем открытое меню');
      }
      handleClose();
      setLastTap(null);
      return;
    }
    
    // Проверяем двойной тап
    if (lastTap && lastTap.messageId === id && (now - lastTap.t) < WIN) {
      if (__DEV__) {
        console.log('🔥 ДВОЙНОЙ ТАП! timeDiff:', now - lastTap.t);
        GestureProbe.log({ 
          type: 'doubleTap', 
          t: Date.now(), 
          msgId: id, 
          x: e?.nativeEvent?.pageX, 
          y: e?.nativeEvent?.pageY 
        });
      }
      // ДАБЛ-ТАП = открываем реакции
      const ref = messageRefs.current.get(id);
      if (__DEV__) {
        console.log('🔥 ref found:', !!ref);
      }
      if (ref) {
        setLocalSelectedMessageId(id);
        setLastTouch?.(e?.nativeEvent?.pageX, e?.nativeEvent?.pageY);
        openAtMessage(id, ref);
      } else {
        if (__DEV__) {
          console.log('🔥 ERROR: ref not found for message:', id);
        }
      }
      setLastTap(null);
      return;
    }
    
    // Если тапаем по другому сообщению - сбрасываем lastTap
    if (lastTap && lastTap.messageId !== id) {
      if (__DEV__) {
        console.log('🔥 Different message, resetting lastTap');
      }
      setLastTap(null);
    }
    
    // Обычный тап - запоминаем для возможного двойного тапа
    if (__DEV__) {
      console.log('🔥 First tap, setting lastTap');
    }
    setLastTap({ messageId: id, t: now });
  }, [lastTap, openAtMessage, setLastTouch, visible, showHeaderActions, handleClose]);

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
    if (__DEV__) {
      GestureProbe.log({ type: 'scrollBegin', t: Date.now() });
    }
    scrollingRef.current = true;
    handleClose();
    onScrollBeginDrag?.();
  }, [handleClose, onScrollBeginDrag]);

  const handleScrollEndDrag = useCallback(() => {
    if (__DEV__) {
      GestureProbe.log({ type: 'scrollEnd', t: Date.now() });
    }
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
            selectedMessageId={selectedMessageId}
            keyboardHeight={keyboardHeight}
          />
       </Portal>
    </View>
  );
};

export default ChatListWithReactions;
