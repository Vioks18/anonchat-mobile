import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEMES } from '../constants/themes';
import { useMessageStore } from '../hooks/useMessageStore';
import { Message } from '../types/message';

// Форматирование времени HH:mm
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

interface MessageWithReactionsProps {
  message: Message;
  isMyMessage: boolean;
  isSelected: boolean;
  onLongPress: (messageId: string, event?: any) => void;
  onPress: (messageId: string, event?: any) => void;
  registerRef: (id: string, ref: any) => void;
}

const MessageWithReactions: React.FC<MessageWithReactionsProps> = ({
  message,
  isMyMessage,
  isSelected,
  onLongPress,
  onPress,
  registerRef,
}) => {
  const rootRef = useRef<View>(null);
  const { removeReaction } = useMessageStore();
  
  // Метаданные
  const status = isMyMessage ? (message.status ?? 'sent') : undefined;
  const time = formatTime(message.timestamp);

  // Определяем ширину пузыря на основе длины текста
  const getBubbleStyle = () => {
    const textLength = message.text.length;
    if (textLength <= 20) {
      return { alignSelf: 'flex-start' as const }; // Короткие - компактные
    } else {
      return {}; // Средние и длинные - занимают всю ширину
    }
  };

  // Определяем отступ для текста
  const getTextStyle = () => {
    const textLength = message.text.length;
    if (textLength <= 20) {
      return { paddingRight: 50 }; // Короткие - отступ от даты
    } else {
      return { 
        paddingBottom: 20, // Отступ снизу для меты
        paddingTop: 6 // Опускаем длинные сообщения ниже
      }; 
    }
  };

  // Обработчик реакций
  const handleReactionPress = (reaction: string) => {
    removeReaction(message.id, reaction);
  };

  React.useEffect(() => {
    if (rootRef.current) {
      registerRef(message.id, rootRef.current);
    }
  }, [message.id, registerRef]);

  return (
    <View style={[
      styles.messageContainer,
      isMyMessage ? styles.messageMe : styles.messageOther
    ]}>
      {/* Overlay выделения */}
      {isSelected && (
        <View 
          style={[
            StyleSheet.absoluteFillObject,
            styles.selectionOverlay
          ]} 
          pointerEvents="none" 
        />
      )}
      
      <View ref={rootRef} style={styles.messageContent}>
        <TouchableOpacity
          onPress={() => onPress?.(message.id)}
          onLongPress={(e) => onLongPress?.(message.id, e)}
          delayLongPress={600}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={[
            styles.bubble,
            isMyMessage ? styles.myBubble : styles.theirBubble,
            getBubbleStyle(), // Динамическая ширина
          ]}
        >
          <Text style={[styles.messageText, getTextStyle()]}>
            {message.text}
          </Text>
          
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>{time}</Text>
            {isMyMessage && status !== 'sending' && (
              <Ionicons
                style={styles.statusIcon}
                size={14}
                name={
                  status === 'read' || status === 'delivered'
                    ? 'checkmark-done-outline'
                    : 'checkmark-outline'
                }
                color={status === 'read' ? '#FFFFFF' : 'rgba(255,255,255,0.9)'}
              />
            )}
            {isMyMessage && status === 'sending' && (
              <ActivityIndicator 
                size={12} 
                style={styles.statusIcon} 
                color="rgba(255,255,255,0.9)"
              />
            )}
          </View>
        </TouchableOpacity>
        
        {/* Реакции */}
        {message.reactions && message.reactions.length > 0 && (
          <View style={[
            styles.reactionsContainer,
            isMyMessage ? styles.reactionsMe : styles.reactionsOther
          ]}>
            {message.reactions.map((reaction, index) => (
              <TouchableOpacity
                key={index}
                style={styles.reactionChip}
                onPress={() => handleReactionPress(reaction)}
                activeOpacity={0.7}
              >
                <Text style={styles.reactionText}>{reaction}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 2,
    paddingHorizontal: 12,
  },
  messageMe: {
    alignItems: 'flex-end',
  },
  messageOther: {
    alignItems: 'flex-start',
  },
  messageContent: {
    maxWidth: '85%',
  },
  selectionOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
  },
  bubble: {
    maxWidth: '100%',
    minWidth: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    position: 'relative',
  },
  myBubble: {
    backgroundColor: '#7B61FF',
  },
  theirBubble: {
    backgroundColor: '#2C2C2E',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    paddingTop: 2, // Возвращаем обратно
    flexShrink: 1,
  },
  metaRow: {
    position: 'absolute',
    right: 8,
    bottom: 6, // Выравниваем с текстом
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  statusIcon: {
    marginLeft: 2,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  reactionsMe: {
    justifyContent: 'flex-end',
  },
  reactionsOther: {
    justifyContent: 'flex-start',
  },
  reactionChip: {
    backgroundColor: THEMES.dark.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEMES.dark.border,
  },
  reactionText: {
    fontSize: 14,
  },
});

export default React.memo(MessageWithReactions);
