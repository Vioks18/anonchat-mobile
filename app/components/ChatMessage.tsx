import React, { useCallback, useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Message } from '../types/message';
import { formatTimestamp } from '../utils/formatTimestamp';

interface ChatMessageProps {
  item: Message;
  handlePress: (messageId: string) => void;
  handleLongPress: (messageId: string) => void;
  removeReaction: (messageId: string) => void;
  addReaction: (messageId: string, reaction: string) => void;
  showReactions: string | null;
  selectedMessages: Set<string>;
  themedStyles: any;
  styles: any;
}

export const ChatMessage: React.FC<ChatMessageProps> = React.memo(({
  item,
  handlePress,
  handleLongPress,
  removeReaction,
  addReaction,
  showReactions,
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

  // useMemo для реакций - оптимизировано
  const messageReactions = useMemo(() => {
    try {
      if (!item.reactions || item.reactions.length === 0) return null;
      
      return item.reactions.map((reaction, index) => (
        <TouchableOpacity
          key={index}
          style={styles.reaction}
          onPress={() => {
            try {
              removeReaction(item.id);
            } catch (error) {
              console.error('ChatMessage: Ошибка удаления реакции', error);
            }
          }}
        >
          <Text style={styles.reactionText}>{reaction}</Text>
        </TouchableOpacity>
      ));
    } catch (error) {
      console.error('ChatMessage: Ошибка создания реакций', error);
      return null;
    }
  }, [item.reactions, item.id, removeReaction, styles]);

  // useMemo для попапа реакций - оптимизировано
  const reactionsPopup = useMemo(() => {
    try {
      if (showReactions !== item.id) return null;
      
      const isMe = item.sender === "me";
      const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];
      
      return (
        <View style={[styles.reactionsPopup, isMe ? styles.reactionsPopupRight : {}]}>
          {reactions.map((reaction) => (
            <TouchableOpacity
              key={reaction}
              style={styles.reactionButton}
              onPress={() => {
                try {
                  addReaction(item.id, reaction);
                } catch (error) {
                  console.error('ChatMessage: Ошибка добавления реакции', error);
                }
              }}
            >
              <Text style={styles.reactionButtonText}>{reaction}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    } catch (error) {
      console.error('ChatMessage: Ошибка создания попапа реакций', error);
      return null;
    }
  }, [showReactions, item.id, item.sender, addReaction, styles]);

  // useMemo для превью ответа - оптимизировано
  const replyPreview = useMemo(() => {
    try {
      if (!item.replyTo) return null;
      
      return (
        <View style={styles.replyPreview}>
          <Text style={styles.replyPreviewText} numberOfLines={1}>
            {item.replyTo.text}
          </Text>
        </View>
      );
    } catch (error) {
      console.error('ChatMessage: Ошибка создания превью ответа', error);
      return null;
    }
  }, [item.replyTo, styles]);

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
          {replyPreview}
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
          {messageReactions && (
            <View style={styles.reactionsContainer}>
              {messageReactions}
            </View>
          )}
        </View>
        {reactionsPopup}
      </View>
    </TouchableOpacity>
  );
}); 