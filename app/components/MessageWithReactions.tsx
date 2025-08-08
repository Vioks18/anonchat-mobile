import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { THEMES } from '../constants/themes';
import { useMessageStore } from '../hooks/useMessageStore';
import { useReactions } from '../hooks/useReactions';
import { useSelectedMessageAnimation } from '../hooks/useSelectedMessageAnimation';
import { Message } from '../types/message';
import MessageReactions from './reactions/MessageReactions';

interface MessageWithReactionsProps {
  message: Message;
  isMyMessage: boolean;
  isSelected: boolean;
  onLongPress: () => void;
  onPress: () => void;
  registerRef?: (id: string, ref: any) => void;
}

const MessageWithReactionsComponent: React.FC<MessageWithReactionsProps> = ({
  message,
  isMyMessage,
  isSelected,
  onLongPress,
  onPress,
  registerRef
}) => {
  const currentTheme = useMessageStore((s: any) => s.currentTheme || 'dark') as keyof typeof THEMES;
  const rootRef = useRef<View>(null);
  const { summary, onToggleReaction, reactionsHash } = useReactions(message.id);
  const { scaleAnim, shadowAnim } = useSelectedMessageAnimation(isSelected);

  useEffect(() => {
    registerRef?.(message.id, rootRef.current);
  }, [message.id, registerRef]);

  return (
    <View ref={rootRef}>
      <TouchableOpacity
        onLongPress={onLongPress}
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}
      >
                 <Animated.View
           style={[
             styles.messageBubble,
             isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
             {
               backgroundColor: isMyMessage 
                 ? THEMES[currentTheme].bubbleMe 
                 : THEMES[currentTheme].bubbleOther,
               transform: [{ scale: scaleAnim }],
               shadowOpacity: isSelected ? shadowAnim : 0,
               shadowColor: THEMES[currentTheme].accent,
               shadowOffset: { width: 0, height: 2 },
               shadowRadius: 4,
               elevation: isSelected ? 3 : 0,
             }
           ]}
         >
          <Text
            style={[
              styles.messageText,
              {
                color: THEMES[currentTheme].text
              }
            ]}
          >
            {message.text}
          </Text>
        </Animated.View>
      </TouchableOpacity>
      
      {summary.length > 0 && (
        <MessageReactions
          messageId={message.id}
          reactions={summary}
          onReactionToggle={onToggleReaction}
          themedStyles={THEMES[currentTheme]}
          isMyMessage={isMyMessage}
        />
      )}
    </View>
  );
};

const MessageWithReactions = React.memo(MessageWithReactionsComponent, (prev, next) => {
  const idEqual = prev.message.id === next.message.id;
  const textEqual = prev.message.text === next.message.text;
  const senderEqual = prev.message.sender === next.message.sender;
  const selectedEqual = prev.isSelected === next.isSelected;
  const isMyEqual = prev.isMyMessage === next.isMyMessage;
  // Реакции: сравниваем по длине массива и строке-сигнатуре, если передадут
  const prevReactions = (prev.message.reactions || []).join('|');
  const nextReactions = (next.message.reactions || []).join('|');
  const reactionsEqual = prevReactions === nextReactions;
  return idEqual && textEqual && senderEqual && selectedEqual && isMyEqual && reactionsEqual;
});

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default MessageWithReactions;
