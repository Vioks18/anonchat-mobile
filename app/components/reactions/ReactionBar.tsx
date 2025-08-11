import React from 'react';
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
  const insets = useSafeAreaInsets();
  const { addReaction } = useMessageStore();
  const [measuredWidth, setMeasuredWidth] = React.useState(0);

  const position = React.useMemo(() => {
    if (!anchor) return { x: 0, y: 0 };
    
    const W = Dimensions.get('window').width;
    const H = Dimensions.get('window').height;
    const barW = measuredWidth || (AVAILABLE_REACTIONS.length * 44 + 16);
    const barH = 56;
    
    // Позиционирование от точки тапа (если есть)
    const baseX = anchor.touchX ?? (anchor.x + anchor.w / 2);
    let left = Math.max(12, Math.min(baseX - barW / 2, W - barW - 12));
    
    const safeTop = insets.top + 12;
    const safeBottom = H - insets.bottom - keyboardHeight - 12;
    
    // Пытаемся разместить над сообщением
    let top = (anchor.touchY ?? anchor.y) - barH - 12;
    
    // Если не помещается сверху - размещаем снизу
    if (top < safeTop) {
      top = (anchor.touchY ?? (anchor.y + anchor.h)) + 12;
    }
    
    // Если не помещается снизу - размещаем по центру экрана
    if (top + barH > safeBottom) {
      top = Math.max(safeTop, (safeBottom - barH) / 2);
    }
    
    return { x: left, y: top };
  }, [anchor, measuredWidth, insets.top, insets.bottom, keyboardHeight]);

  const handleReaction = (reaction: string) => {
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
  };

  if (!visible || !anchor) {
    if (__DEV__) {
      // console.log('🔥 ReactionBar: not visible', { visible, anchor: !!anchor });
    }
    return null;
  }

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
        onLayout={(e) => setMeasuredWidth(e.nativeEvent.layout.width)}
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
