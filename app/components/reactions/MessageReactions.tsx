import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MessageReactionsProps } from './types';

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  onReactionToggle,
  themedStyles,
  isMyMessage = false, // Новый проп для определения позиционирования
}) => {
  if (!reactions || reactions.length === 0) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      isMyMessage ? styles.containerMyMessage : styles.containerOtherMessage
    ]}>
      <View style={styles.reactionsContainer}>
        {reactions.map((reaction, index) => (
          <TouchableOpacity
            key={`${messageId}-${reaction.emoji}-${index}`}
            style={[
              styles.reactionChip,
              reaction.reactedByMe && styles.reactionChipActive,
            ]}
            onPress={() => onReactionToggle(reaction.emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            {reaction.count > 1 && (
              <Text style={[styles.reactionCount, { color: themedStyles.text }]}>
                {reaction.count}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0, // Убираю отступ сверху - реакции прилегают к сообщению
    marginHorizontal: 8,
  },
  containerMyMessage: {
    alignSelf: 'flex-end',
    marginRight: 4, // Дополнительный отступ справа для моих сообщений
  },
  containerOtherMessage: {
    alignSelf: 'flex-start',
    marginLeft: 4, // Дополнительный отступ слева для чужих сообщений
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Убираю фон
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 0.5, // Небольшая рамка
    borderColor: 'rgba(255,255,255,0.1)', // Светлая рамка
    minHeight: 28,
    // Убираю тени
  },
  reactionChipActive: {
    backgroundColor: 'transparent', // Убираю фон
    borderWidth: 0.5, // Небольшая рамка
    borderColor: 'rgba(59, 130, 246, 0.3)', // Синяя рамка для активной
    // Убираю тени
  },
  reactionEmoji: {
    fontSize: 18, // Увеличил с 16 до 18
    marginRight: 3,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default MessageReactions;
