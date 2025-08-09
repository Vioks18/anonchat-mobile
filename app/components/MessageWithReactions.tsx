import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef } from 'react';
import { Animated, Dimensions, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { THEMES } from '../constants/themes';
import { useMessageStore } from '../hooks/useMessageStore';
import { useSelectedMessageAnimation } from '../hooks/useSelectedMessageAnimation';
import { Message } from '../types/message';
import { formatTimestamp } from '../utils/formatTimestamp';

const SCREEN_W = Dimensions.get('window').width;
const MAX_BUBBLE_W = Math.floor(SCREEN_W * 0.78);
const MIN_BUBBLE_W = Math.floor(SCREEN_W * 0.40);

// Утилита для добавления прозрачности к цвету
const addOpacity = (color: string, opacity: number) => {
  if (color.startsWith('#')) {
    const hex = Math.floor(opacity * 255).toString(16).padStart(2, '0');
    return color + hex;
  }
  return color;
};

// Простое и красивое масштабирование пузырьков
const computeBubbleLayout = (text: string, screenW: number) => {
  const len = (text ?? '').trim().length;
  
  // Адаптивный maxWidth для длинных сообщений
  let maxWidth: number;
  if (len > 20) {
    maxWidth = Math.floor(screenW * 0.85); // Больше места для очень длинных
  } else if (len > 10) {
    maxWidth = Math.floor(screenW * 0.80); // Больше места для длинных
  } else {
    maxWidth = Math.floor(screenW * 0.75); // Стандарт для коротких
  }
  
  // Расширяем пузыри влево для лучшего вида
  let minWidth: number;
  
  if (len <= 3) {
    minWidth = Math.floor(screenW * 0.25); // Шире для коротких
  } else if (len <= 6) {
    minWidth = Math.floor(screenW * 0.30); // Шире для средних
  } else {
    minWidth = Math.floor(screenW * 0.35); // Шире для длинных
  }
  
  return { minWidth, maxWidth };
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
  
  // Анимация выбранного сообщения
  const { animatedStyle } = useSelectedMessageAnimation({ isSelected });

  // Умная обработка тапов
  const onPressWrap = (e: any) => {
    // Передаем closeAll только если сообщение выбрано (меню открыто)
    onPress?.(message.id, { ...e, closeAll: isSelected });
  };
  
  const onLongPressWrap = (e: any) => onLongPress?.(message.id, e);

  const handleReactionPress = (reaction: string) => {
    removeReaction(message.id, reaction);
  };

  // Текущая тема для метаданных
  const currentTheme = THEMES.dark;
  
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
        ((message.text?.length ?? 0) <= 3 ? 6 : 8), // Больше места для метаданных
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
      <View style={[
        styles.messageContent,
        isMyMessage ? styles.messageContentMe : styles.messageContentOther
      ]}>
        <Animated.View style={[animatedStyle]}>
          <Pressable
            ref={rootRef}
            onPress={onPressWrap}
            onLongPress={onLongPressWrap}
            delayLongPress={500}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            android_disableSound
                         style={[
               styles.bubble,
               bubbleStyle,
               isMyMessage ? styles.bubbleMe : styles.bubbleOther,
                               isSelected && {
                  ...styles.selectedBubble,
                }
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
          </Pressable>
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

const styles = {
  messageContainer: {
    marginVertical: 2,
    flexDirection: 'row' as const,
    paddingHorizontal: 6,
    width: '100%' as const, // Полная ширина контейнера
  },
  messageMe: {
    justifyContent: 'flex-end' as const,
  },
  messageOther: {
    justifyContent: 'flex-start' as const,
  },
  messageContent: {
    alignItems: 'flex-end' as const,
    maxWidth: '100%' as const, // Ограничиваем ширину контента
  },
  messageContentMe: {
    alignItems: 'flex-end' as const,
    maxWidth: '100%' as const,
  },
  messageContentOther: {
    alignItems: 'flex-start' as const,
    maxWidth: '100%' as const,
  },
  bubble: {
    // Базовые стили перенесены в bubbleBase
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
    backgroundColor: THEMES.dark.bubbleMe,
    shadowColor: THEMES.dark.bubbleMe,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  bubbleOther: {
    backgroundColor: THEMES.dark.bubbleOther,
    shadowColor: THEMES.dark.bubbleOther,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  bubbleText: {
    fontSize: 17,
    color: '#fff',
    lineHeight: 22,
    flexWrap: 'wrap' as const,
    alignSelf: 'flex-start' as const,
    minWidth: 0,
  },
  selectedBubble: {
    opacity: 0.8,
  },
  reactionsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginTop: 4,
    gap: 4,
  },
  reactionsMe: {
    justifyContent: 'flex-end' as const,
  },
  reactionsOther: {
    justifyContent: 'flex-start' as const,
  },
  reactionChip: {
    backgroundColor: THEMES.dark.inputBg + '80',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: THEMES.dark.border + '40',
  },
  reactionText: {
    fontSize: 14,
    color: '#fff',
  },
  metaRow: {
    position: 'absolute' as const,
    right: 8,
    bottom: 6,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  time: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
};

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
