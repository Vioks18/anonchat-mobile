import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEMES } from '../constants/themes';
import { useMessageStore } from '../hooks/useMessageStore';
import { useSelectedMessageAnimation } from '../hooks/useSelectedMessageAnimation';
import { Message } from '../types/message';
import { flags } from '../utils/flags';
import { formatTimestamp } from '../utils/formatTimestamp';

const SCREEN_W = Dimensions.get('window').width;
const MAX_BUBBLE_W = Math.floor(SCREEN_W * 0.78);
const MIN_BUBBLE_W = Math.floor(SCREEN_W * 0.40);

// Утилиты для работы с цветами
const addOpacity = (color: string, opacity: number) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Вычисление размеров пузырька
const computeBubbleLayout = (text: string, screenW: number) => {
  const textLength = text?.length || 0;
  const maxWidth = screenW * 0.75;
  
  if (textLength <= 3) {
    return { minWidth: 60, maxWidth: 120 };
  } else if (textLength <= 20) {
    return { minWidth: Math.min(textLength * 8 + 40, maxWidth), maxWidth };
  } else {
    return { minWidth: 80, maxWidth };
  }
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
  const { animatedStyle } = useSelectedMessageAnimation({ isSelected, duration: 200 });
  
  // Анимация выделения с scale и тенью
  const scaleAnim = useRef(new Animated.Value(isSelected ? 1.03 : 1)).current;
  const currentTheme = THEMES.dark; // Используем текущую тему
  
  useEffect(() => {
    if (flags.bubbleAnim) {
      Animated.spring(scaleAnim, {
        toValue: isSelected ? 1.03 : 1,
        useNativeDriver: true,
        tension: 140,
        friction: 10
      }).start();
    }
  }, [isSelected, scaleAnim]);

  // Обработчик реакций
  const handleReactionPress = (reaction: string) => {
    if (__DEV__) {
      console.log('🔥 ReactionBar: handleReaction', { reaction, selectedMessageId: message.id });
    }
    removeReaction(message.id, reaction);
  };

  // Текущая тема для метаданных
  const currentThemeData = currentTheme;
  
  // Метаданные
  const time = formatTimestamp(message.timestamp);
  const status = (message.status ?? 'sent') as 'sending' | 'sent' | 'delivered' | 'read';
  const metaColor = '#ffffff'; // Белый цвет для времени
  const tickColor = status === 'read' ? '#ffffff' : '#ffffff'; // Белые галочки для контраста
  
  // Адаптивные размеры пузырька
  const { minWidth, maxWidth } = useMemo(
    () => computeBubbleLayout(message.text, SCREEN_W),
    [message.text, SCREEN_W]
  );

  // Стили пузырька с адаптивной шириной
  const bubbleStyle = [
    styles.bubbleBase,
    {
      minWidth,
      maxWidth,
      paddingBottom: isMyMessage ? 16 : 10, // Больше места для метаданных только для моих сообщений
      paddingHorizontal: (message.text?.length ?? 0) <= 3 ? 6 : 8, // Более компактные отступы
      paddingRight: isMyMessage ? 
        ((message.text?.length ?? 0) > 20 ? 80 : 60) : // Больше места для очень длинных
        ((message.text?.length ?? 0) <= 3 ? 28 : 8), // Минимум 28px для метаданных
      alignSelf: isMyMessage ? 'flex-end' as const : 'flex-start' as const,
    },
  ];

  // Стиль текста с умным центрированием
  const textStyle = [
    styles.bubbleText,
    { 
      textAlign: (message.text?.length ?? 0) <= 3 ? 'center' as const : 'left' as const,
      marginTop: isMyMessage ? ((message.text?.length ?? 0) <= 3 ? 6 : 4) : 2, // Умный отступ для моих сообщений
    },
  ];

  // Анимированный стиль с scale и тенью
  const animatedBubbleStyle = useMemo(() => {
    if (!flags.bubbleAnim) {
      return {}; // Убираем дублирующий фон
    }
    
    return {
      transform: [{ scale: scaleAnim }],
      shadowColor: currentThemeData.accent,
      shadowOpacity: isSelected ? 0.25 : 0,
      shadowRadius: isSelected ? 8 : 0,
      shadowOffset: { width: 0, height: 2 },
      elevation: isSelected ? 6 : 0,
    };
  }, [isSelected, scaleAnim, currentThemeData.accent]);

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
      {/* Overlay выделения на всю строку */}
      {isSelected && (
        <View 
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: addOpacity(currentThemeData.accent, 0.08),
              borderRadius: 12,
            }
          ]} 
          pointerEvents="none" 
        />
      )}
      <View style={[
        styles.messageContent,
        isMyMessage ? styles.messageContentMe : styles.messageContentOther
      ]}>
        <Animated.View style={[animatedStyle]}>
          <View ref={rootRef}>
            <Animated.View style={animatedBubbleStyle}>
              <TouchableOpacity
                onPress={() => {
                  console.log('🔥 TAP DETECTED:', message.id);
                  onPress?.(message.id);
                }}
                onLongPress={(e) => {
                  console.log('🔥 LONG PRESS DETECTED:', message.id);
                  onLongPress?.(message.id, e);
                }}
                delayLongPress={600}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={[
                  styles.bubble,
                  bubbleStyle,
                  isMyMessage ? styles.bubbleMe : styles.bubbleOther,
                ]}
              >
                <Text style={textStyle}>{message.text}</Text>
                
                {/* Метаданные (время + галочки) */}
                {isMyMessage && (
                  <View style={styles.metaRow} pointerEvents="none">
                    <Text style={[styles.time, { color: metaColor }]}>{time}</Text>
                    <Ionicons
                      name={
                        status === 'sending'   ? 'time-outline' :
                        status === 'delivered' ? 'checkmark-done-outline' :
                        status === 'read'      ? 'checkmark-done-outline' :
                                                 'checkmark-outline'
                      }
                      size={16}
                      color={tickColor}
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
        
        {/* Отображение реакций */}
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
    maxWidth: '80%',
  },
  messageContentMe: {
    alignItems: 'flex-end',
  },
  messageContentOther: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
    minWidth: 44,
    maxWidth: '80%',
    paddingRight: 40, // резерв под мету
    position: 'relative',
    justifyContent: 'center',
  },
  bubbleBase: {
    position: 'relative' as const,
    flexShrink: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  bubbleMe: {
    backgroundColor: THEMES.dark.accent,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bubbleOther: {
    backgroundColor: THEMES.dark.bubbleOther,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bubbleText: {
    color: THEMES.dark.text,
    fontSize: 16,
    lineHeight: 20,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  selectedBubble: {
    borderWidth: 0,
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
  metaRow: {
    position: 'absolute',
    right: 8,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default React.memo(MessageWithReactions, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.text === nextProps.message.text &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.reactions?.length === nextProps.message.reactions?.length &&
    prevProps.isMyMessage === nextProps.isMyMessage &&
    prevProps.isSelected === nextProps.isSelected
  );
});
