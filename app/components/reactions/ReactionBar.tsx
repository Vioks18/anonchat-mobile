import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEMES } from '../../constants/themes';
import { useMessageStore } from '../../hooks/useMessageStore';
import { ReactionAnchor } from '../../hooks/useReactionState';
import ActionsBar from './ActionsBar';
import { EmojiType } from './types';

const AVAILABLE_REACTIONS: { key: EmojiType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: '👍', icon: 'thumbs-up-outline' },
  { key: '❤️', icon: 'heart-outline' },
  { key: '😂', icon: 'happy-outline' },
  { key: '😮', icon: 'alert-circle-outline' },
  { key: '😢', icon: 'sad-outline' },
  { key: '😡', icon: 'flame-outline' },
];

interface ReactionBarProps {
  visible: boolean;
  anchor: ReactionAnchor | null;
  onClose: () => void;
  selectedMessageId?: string | null;
  getActions?: (message: any) => any[]; // подготовка под меню
}

const ReactionBar: React.FC<ReactionBarProps> = ({
  visible,
  anchor,
  onClose,
  selectedMessageId,
  getActions
}) => {
  const insets = useSafeAreaInsets();
  const currentTheme = useMessageStore((s: any) => s.currentTheme || 'dark') as keyof typeof THEMES;
  const addReaction = useMessageStore((s: any) => s.addReaction);
  const getMessageById = useMessageStore((s: any) => s.getMessageById);
  const [measuredWidth, setMeasuredWidth] = React.useState<number | null>(null);

  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Сначала opacity, потом scale для красивого появления
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 7,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.8,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const handleReactionPress = (emoji: EmojiType) => {
    if (selectedMessageId) {
      addReaction(selectedMessageId, emoji);
      console.log('Реакция добавлена:', emoji, 'для сообщения:', selectedMessageId);
    }
    onClose();
  };

  const calculatePosition = () => {
    if (!anchor) return { x: 0, y: 0 };
    
    const screenWidth = Dimensions.get('window').width;
    const fallbackWidth = AVAILABLE_REACTIONS.length * 44 + 16;
    const barWidth = measuredWidth || fallbackWidth;
    const barHeight = 56;
    
    let x = anchor.x + anchor.w / 2 - barWidth / 2;
    const margin = 12;
    let yTop = anchor.y - barHeight - 60;
    let yBottom = anchor.y + anchor.h + margin;
    let y = yTop;
    
    // Зажимаем в пределах экрана
    if (x < 12) x = 12;
    if (x + barWidth > screenWidth - 12) x = screenWidth - barWidth - 12;
    
    // Флип вниз при нехватке места сверху
    if (yTop < insets.top + 24) {
      y = yBottom;
    }
    
    return { x, y };
  };

  if (!visible || !anchor) return null;

  const position = calculatePosition();

  const message = selectedMessageId ? getMessageById?.(selectedMessageId) : undefined;
  const actions = getActions ? getActions(message) : null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          left: position.x,
          top: position.y,
        },
      ]}
    >
      <View
        pointerEvents="auto"
        style={[
          styles.reactionBar,
          {
            backgroundColor: THEMES[currentTheme].inputBg + 'CC',
            shadowColor: THEMES[currentTheme].accent,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 8,
          },
        ]}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w && w > 0) setMeasuredWidth(w);
        }}
      >
        {AVAILABLE_REACTIONS.map(({ key, icon }) => (
          <TouchableOpacity
            key={key}
            style={styles.reactionButton}
            onPress={() => handleReactionPress(key)}
            activeOpacity={0.7}
          >
            <Ionicons name={icon} size={24} color={THEMES[currentTheme].text} />
          </TouchableOpacity>
        ))}
      </View>

      {Array.isArray(actions) && actions.length > 0 && (
        <ActionsBar actions={actions} themedStyles={THEMES[currentTheme]} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  reactionBar: {
    flexDirection: 'row',
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  reactionButton: {
    width: 44,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  actionsBarPlaceholder: {
    height: 48,
    marginTop: 8,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
});

export default ReactionBar;
