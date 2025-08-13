import React, { useCallback } from 'react';
import { Animated, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEMES } from '../../constants/themes';
import { pickOverlayForBg } from '../../constants/themeUtils';
import { useMessageStore } from '../../hooks/useMessageStore';
import { ReactionAnchor } from '../../hooks/useReactionState';

const AVAILABLE_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

interface ReactionBarProps {
  visible: boolean;
  anchor: ReactionAnchor | null;
  onClose: () => void;
  selectedMessageId: string | null;
  keyboardHeight?: number;
}

const ReactionBar: React.FC<ReactionBarProps> = ({
  visible,
  anchor,
  onClose,
  selectedMessageId,
  keyboardHeight = 0,
}) => {
  if (!visible || !anchor) return null;

  const insets = useSafeAreaInsets();
  const { addReaction } = useMessageStore();
  const [measuredWidth, setMeasuredWidth] = React.useState(0);

  const position = React.useMemo(() => {
    if (!anchor) return { x: 0, y: 0 };
    
    const W = Dimensions.get('window').width;
    const H = Dimensions.get('window').height;
    const barW = measuredWidth || (AVAILABLE_REACTIONS.length * 44 + 16);
    const barH = 56;
    
    // Стабильное позиционирование от точки тапа
    const baseX = anchor.touchX ?? (anchor.x + anchor.w / 2);
    let left = Math.max(12, Math.min(baseX - barW / 2, W - barW - 12));
    
    // Улучшенное позиционирование с учетом клавиатуры
    let top = (anchor.touchY ?? anchor.y) - barH - 12;
    
    // Защита от выхода за верх экрана
    if (top < insets.top + 20) {
      top = insets.top + 20;
    }
    
    // Защита от выхода за нижний край с учетом клавиатуры
    const maxTop = H - barH - keyboardHeight - insets.bottom - 20;
    if (top > maxTop) {
      top = maxTop;
    }
    
    // Стабилизация - округляем до целых пикселей
    return { 
      x: Math.round(left), 
      y: Math.round(top) 
    };
  }, [anchor?.touchX, anchor?.touchY, anchor?.x, anchor?.y, measuredWidth, keyboardHeight, insets]);

  const handleReaction = useCallback((reaction: string) => {
    if (__DEV__) {
      // if (__DEV__) console.log('🔥 ReactionBar: handleReaction', { reaction, selectedMessageId });
    }
    if (selectedMessageId) {
      addReaction(selectedMessageId, reaction);
      onClose(); // Клик по эмодзи
      
      // Очищаем выбор после добавления реакции
      const clearSelection = useMessageStore.getState().clearSelection;
      clearSelection();
    } else if (__DEV__) {
      if (__DEV__) console.warn('⚠️ ReactionBar: selectedMessageId is null!');
    }
  }, [selectedMessageId, addReaction, onClose]);

  const handleLayout = useCallback((e: any) => {
    setMeasuredWidth(e.nativeEvent.layout.width);
  }, []);

  // Адаптивные цвета для панели реакций
  const overlayColors = pickOverlayForBg(THEMES.dark.inputBg, 'dark');

  const styles = {
    container: {
      position: 'absolute' as const,
      left: position.x,
      top: position.y,
      zIndex: 1000,
    },
    panel: {
      alignItems: 'center' as const,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 28,
      backgroundColor: THEMES.dark.inputBg + 'F0', // Более прозрачный фон для реакций
      shadowColor: overlayColors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      borderWidth: 1,
      borderColor: overlayColors.overlayColor,
    },
    emojiRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 8,
    },
    emojiButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    emojiText: {
      fontSize: 24,
      lineHeight: 28,
    },
  };

  return (
    <Animated.View 
      style={styles.container} 
      pointerEvents="box-none"
    >
      <View 
        style={styles.panel} 
        pointerEvents="auto"
        onLayout={handleLayout}
      >
        <View style={styles.emojiRow}>
          {AVAILABLE_REACTIONS.map((reaction) => (
            <TouchableOpacity
              key={reaction}
              style={styles.emojiButton}
              onPress={() => handleReaction(reaction)}
              activeOpacity={0.7}
            >
              <Text style={styles.emojiText}>{reaction}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

export default ReactionBar;
