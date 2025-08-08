import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReactionAnchor } from '../../hooks/useReactionState';
import { Message } from '../../types/message';
import ActionsBar from './ActionsBar';
import { EmojiType, ReactionBarProps } from './types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AVAILABLE_REACTIONS: EmojiType[] = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface ReactionBarPropsWithTheme extends ReactionBarProps {
  currentThemeData?: any;
  visible?: boolean;
  anchor?: ReactionAnchor | null;
  getActions?: (message: Message) => any[];
  message?: Message;
}

const ReactionBar: React.FC<ReactionBarPropsWithTheme> = ({
  visible,
  anchor,
  onClose,
  onReactionSelect,
  currentThemeData,
  getActions,
  message,
}) => {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Анимация появления - быстрая и плавная
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Анимация исчезновения
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  // Если не видима или нет anchor - не рендерим
  if (!visible || !anchor) {
    return null;
  }

  // Позиционирование панели по anchor
  const calculatePosition = () => {
    const barWidth = AVAILABLE_REACTIONS.length * 44 + 16; // Точная ширина
    const barHeight = 56;
    
    // Центрируем панель над сообщением
    let x = anchor.x + anchor.w / 2 - barWidth / 2;
    let y = anchor.y - barHeight - 8; // Над сообщением с отступом

    // Проверяем края экрана
    if (x < 12) x = 12;
    if (x + barWidth > screenWidth - 12) x = screenWidth - barWidth - 12;
    
    // Если не помещается сверху, показываем снизу
    if (y < insets.top + 8) {
      y = anchor.y + anchor.h + 8;
    }

    // Проверяем нижний край
    if (y + barHeight > screenHeight - insets.bottom - 12) {
      y = screenHeight - insets.bottom - barHeight - 12;
    }

    return { x, y };
  };

  const { x, y } = calculatePosition();

  const handleReactionPress = (emoji: EmojiType) => {
    onReactionSelect(emoji);
    onClose();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          backgroundColor: currentThemeData?.inputBg 
            ? `${currentThemeData.inputBg}CC`
            : 'rgba(35, 35, 60, 0.95)',
          borderColor: currentThemeData?.border || 'rgba(255, 255, 255, 0.12)',
        },
      ]}
      pointerEvents="auto"
    >
      {/* Первая строка - реакции */}
      <View style={styles.reactionsContainer}>
        {AVAILABLE_REACTIONS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reactionButton}
            onPress={() => handleReactionPress(emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Вторая строка - ActionsBar (пока скрыта) */}
      {message && getActions && (
        <ActionsBar
          message={message}
          getActions={getActions}
          currentThemeData={currentThemeData}
          visible={false} // Пока скрыта
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minHeight: 48,
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  reactionEmoji: {
    fontSize: 20,
  },
});

export default ReactionBar;
