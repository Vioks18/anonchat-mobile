import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

interface EmojiPanelProps {
  visible: boolean;
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
  themeData: any;
}

const EMOJI_CATEGORIES = {
  'Смайлики': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
  'Животные': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'],
  'Еда': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒'],
  'Активности': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁'],
  'Символы': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️']
};

const EmojiPanel: React.FC<EmojiPanelProps> = ({ 
  visible, 
  onEmojiSelect, 
  onClose, 
  themeData 
}) => {
  const screenWidth = Dimensions.get('window').width;

  const panelStyle = useMemo(() => [
    styles.panel,
    {
      backgroundColor: themeData.inputBg,
      borderTopColor: themeData.border,
      width: screenWidth
    }
  ], [themeData.inputBg, themeData.border, screenWidth]);

  const emojiButtonStyle = useMemo(() => [
    styles.emojiButton,
    {
      backgroundColor: themeData.inputBg
    }
  ], [themeData.inputBg]);

  const emojiTextStyle = useMemo(() => [
    styles.emojiText,
    {
      color: themeData.text
    }
  ], [themeData.text]);

  if (!visible) return null;

  return (
    <View style={panelStyle}>
      {/* Заголовок с кнопкой закрытия */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: themeData.text }]}>
          Эмодзи
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={[styles.closeButtonText, { color: themeData.text }]}>
            ✕
          </Text>
        </TouchableOpacity>
      </View>

      {/* Категории эмодзи */}
      {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
        <View key={category} style={styles.category}>
          <Text style={[styles.categoryTitle, { color: themeData.text }]}>
            {category}
          </Text>
          <View style={styles.emojiGrid}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={`${category}-${index}`}
                style={emojiButtonStyle}
                onPress={() => onEmojiSelect(emoji)}
                activeOpacity={0.7}
              >
                <Text style={emojiTextStyle}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    borderTopWidth: 1,
    paddingVertical: 8,
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  category: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  emojiButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 8,
  },
  emojiText: {
    fontSize: 20,
  },
});

export default EmojiPanel;
