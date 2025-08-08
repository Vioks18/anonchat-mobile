import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';
import { useReactions } from '../hooks/useReactions';
import { useReactionState } from '../hooks/useReactionState';
import { Message } from '../types/message';
import ChatMessageSimple from './ChatMessageSimple';
import MessageReactions from './reactions/MessageReactions';

interface MessageWithReactionsProps {
  message: Message;
  themedStyles: any;
  styles: any;
  currentThemeData?: any;
  isSelected?: boolean;
  onLongPress: (messageId: string) => void;
  onPress?: (messageId: string) => void;
}

const MessageWithReactions: React.FC<MessageWithReactionsProps> = React.memo(({
  message,
  themedStyles,
  styles,
  currentThemeData,
  isSelected = false,
  onLongPress,
  onPress,
}) => {
  const rootRef = useRef<View>(null);
  const { summary, onToggleReaction } = useReactions(message.id);
  const { selectedMessageId, visible, openAtMessage } = useReactionState();
  const isMyMessage = message.sender === "me";

  // Обработчик долгого нажатия
  const handleLongPress = useCallback(() => {
    try {
      openAtMessage(message.id, rootRef.current);
      onLongPress?.(message.id);
    } catch (error) {
      console.error('MessageWithReactions: Ошибка долгого нажатия', error);
    }
  }, [message.id, openAtMessage, onLongPress]);

  // Обработчик обычного нажатия (для двойного клика)
  const handlePress = useCallback(() => {
    try {
      // Если панель реакций открыта для этого сообщения, открываем её снова
      if (selectedMessageId === message.id && visible) {
        openAtMessage(message.id, rootRef.current);
      }
      onPress?.(message.id);
    } catch (error) {
      console.error('MessageWithReactions: Ошибка обработки нажатия', error);
    }
  }, [message.id, onPress, selectedMessageId, visible, openAtMessage]);

  return (
    <View ref={rootRef}>
      <ChatMessageSimple
        message={message}
        themedStyles={themedStyles}
        styles={styles}
        currentThemeData={currentThemeData}
        isSelected={isSelected}
        onLongPress={handleLongPress}
        onPress={handlePress}
      />
      <MessageReactions
        messageId={message.id}
        reactions={summary}
        onReactionToggle={onToggleReaction}
        themedStyles={themedStyles}
        isMyMessage={isMyMessage}
      />
    </View>
  );
});

export default MessageWithReactions;
