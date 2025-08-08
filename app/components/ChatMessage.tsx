import React, { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Message } from '../types/message';
import { formatTimestamp } from '../utils/formatTimestamp';

interface ChatMessageProps {
  item: Message;
  handlePress: (messageId: string) => void;
  handleLongPress: (messageId: string) => void;
  selectedMessages: Set<string>;
  themedStyles: any;
  styles: any;
}

const ChatMessageInner: React.FC<ChatMessageProps> = React.memo(({
  item,
  handlePress,
  handleLongPress,
  selectedMessages,
  themedStyles,
  styles,
}) => {
  // useMemo для определения стилей сообщения - оптимизировано
  const messageStyles = useMemo(() => {
    try {
      const isMe = item.sender === "me";
      const isSelected = selectedMessages.has(item.id);
      
      return {
        container: [
          isMe ? styles.bubbleContainer : styles.bubbleContainerOther,
          isSelected && (isMe ? styles.bubbleSelected : styles.bubbleSelectedOther)
        ],
        bubble: [
          styles.bubble,
          isMe ? themedStyles.bubbleMe : themedStyles.bubbleOther
        ]
      };
    } catch (error) {
      console.error('ChatMessage: Ошибка определения стилей сообщения', error);
      return {
        container: [styles.bubbleContainer],
        bubble: [styles.bubble]
      };
    }
  }, [item.sender, item.id, selectedMessages, styles, themedStyles]);

  // useMemo для форматированного времени - оптимизировано
  const formattedTimestamp = useMemo(() => {
    try {
      return formatTimestamp(item.timestamp);
    } catch (error) {
      console.error('ChatMessage: Ошибка форматирования времени', error);
      return '--:--';
    }
  }, [item.timestamp]);

  // useMemo для статуса сообщения - оптимизировано
  const messageStatus = useMemo(() => {
    try {
      if (item.status === "sending") {
        return { text: "⏳", style: styles.statusSending };
      }
      if (item.status === "sent") {
        return { text: "✓", style: styles.statusSent };
      }
      if (item.status === "delivered") {
        return { text: "✓✓", style: themedStyles.statusDelivered };
      }
      if (item.status === "read") {
        return { text: "✓✓", style: themedStyles.statusRead };
      }
      return null;
    } catch (error) {
      console.error('ChatMessage: Ошибка определения статуса сообщения', error);
      return null;
    }
  }, [item.status, styles, themedStyles]);

  // Безопасная обработка нажатий - мемоизирована
  const handlePressSafe = useCallback(() => {
    try {
      handlePress(item.id);
    } catch (error) {
      console.error('ChatMessage: Ошибка обработки нажатия', error);
    }
  }, [handlePress, item.id]);

  const handleLongPressSafe = useCallback(() => {
    try {
      handleLongPress(item.id);
    } catch (error) {
      console.error('ChatMessage: Ошибка обработки долгого нажатия', error);
    }
  }, [handleLongPress, item.id]);

  return (
    <TouchableOpacity
      style={styles.messageContainer}
      onPress={handlePressSafe}
      onLongPress={handleLongPressSafe}
      activeOpacity={0.8}
    >
      <View style={messageStyles.container}>
        <View style={messageStyles.bubble}>
          <Text style={themedStyles.bubbleText}>{item.text}</Text>
          <View style={styles.messageContent}>
            <Text style={themedStyles.timestamp}>
              {formattedTimestamp}
            </Text>
            <View style={styles.statusContainer}>
              {messageStatus && (
                <Text style={messageStatus.style}>{messageStatus.text}</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

});

ChatMessageInner.displayName = 'ChatMessage';

// Экспортируем как default для Expo Router
export default ChatMessageInner;

// Также экспортируем как named export для обратной совместимости
export const ChatMessage = ChatMessageInner; 