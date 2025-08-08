import React from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { useSelectedMessageAnimation } from '../hooks/useSelectedMessageAnimation';
import { Message } from '../types/message';

interface ChatMessageSimpleProps {
  message: Message;
  themedStyles: any;
  styles: any;
  currentThemeData?: any;
  isSelected?: boolean;
  onLongPress?: () => void;
  onPress?: () => void;
}

const ChatMessageSimple: React.FC<ChatMessageSimpleProps> = React.memo(({
  message,
  themedStyles,
  styles,
  currentThemeData,
  isSelected = false,
  onLongPress,
  onPress,
}) => {
  const isMe = message.sender === "me";
  const { scaleAnim, shadowAnim } = useSelectedMessageAnimation(isSelected);

  // Получаем цвет тени в зависимости от темы
  const shadowColor = isMe ? currentThemeData?.bubbleMe : currentThemeData?.bubbleOther;

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        alignSelf: isMe ? 'flex-end' : 'flex-start', // Правильное выравнивание
      }}
    >
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isMe ? styles.messageMe : styles.messageOther,
          // Убираю isSelected && styles.selectedMessage
        ]}
        onLongPress={onLongPress}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Animated.View style={[
          styles.bubble,
          isMe
            ? { 
                ...styles.bubbleMe, 
                backgroundColor: currentThemeData?.bubbleMe,
                shadowColor: shadowColor,
              }
            : { 
                ...styles.bubbleOther, 
                backgroundColor: currentThemeData?.bubbleOther,
                shadowColor: shadowColor,
              },
          isSelected && {
            shadowColor: currentThemeData?.accent || 'rgba(59, 130, 246, 0.7)',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: shadowAnim,
            shadowRadius: 8,
            elevation: shadowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 6],
            }),
          },
        ]}>
          <Text style={[styles.messageText, { color: currentThemeData?.text }]}>
            {message.text || 'Пустое сообщение'}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default ChatMessageSimple;
