import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useMessageStore } from '../hooks/useMessageStore';
import { useReactionState } from '../hooks/useReactionState';
import { Message } from '../types/message';
import MessageWithReactions from './MessageWithReactions';
import ReactionBar from './reactions/ReactionBar';

interface ChatListWithReactionsProps {
  messages: Message[];
  onScrollBeginDrag?: () => void;
}

const ChatListWithReactions: React.FC<ChatListWithReactionsProps> = ({
  messages,
  onScrollBeginDrag
}) => {
  const removeMessage = useMessageStore((s: any) => s.removeMessage);
  const { selectedMessageId, anchor, visible, openAtMessage, close } = useReactionState();
  const messageRefs = useRef(new Map<string, any>());
  const [lastTap, setLastTap] = useState<{ messageId: string; timestamp: number } | null>(null);
  const scrollingRef = useRef<boolean>(false);

  const registerMessageRef = useCallback((id: string, ref: any) => {
    if (ref && id) {
      messageRefs.current.set(id, ref);
    }
  }, []);

  const handleMessageLongPress = useCallback((messageId: string) => {
    if (scrollingRef.current) return;
    const ref = messageRefs.current.get(messageId);
    if (ref) {
      openAtMessage(messageId, ref);
    }
  }, [openAtMessage]);

  const handleMessagePress = useCallback((messageId: string) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 260; // 220–280 мс

    if (scrollingRef.current) return;

    if (selectedMessageId) { 
      close(); 
      return; 
    }

    if (lastTap && lastTap.messageId === messageId && now - lastTap.timestamp < DOUBLE_TAP_DELAY) {
      const ref = messageRefs.current.get(messageId);
      if (ref) openAtMessage(messageId, ref); // ✅ тот же путь, что у long-press
      setLastTap(null);
      return;
    }

    setLastTap({ messageId, timestamp: now });
  }, [selectedMessageId, lastTap, close, openAtMessage]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isMyMessage = item.sender === 'me';
    const isSelected = selectedMessageId === item.id;

    return (
      <MessageWithReactions
        message={item}
        isMyMessage={isMyMessage}
        isSelected={isSelected}
        onLongPress={() => handleMessageLongPress(item.id)}
        onPress={() => handleMessagePress(item.id)}
        registerRef={registerMessageRef}
      />
    );
  }, [selectedMessageId, handleMessageLongPress, handleMessagePress, registerMessageRef]);

  const handleScrollBeginDrag = useCallback(() => {
    scrollingRef.current = true;
    close();
    onScrollBeginDrag?.();
  }, [close, onScrollBeginDrag]);

  const handleScrollEndDrag = useCallback(() => {
    setTimeout(() => {
      scrollingRef.current = false;
    }, 100);
  }, []);

  const getActions = useCallback((message: Message | undefined) => {
    if (!message) return [];

    return [
      {
        key: 'reply' as const,
        icon: (<Text style={{ fontSize: 16 }}>↩️</Text>),
        onPress: () => {
          if (__DEV__) console.warn('Reply action: no-op (handler not wired)', message.id);
          close();
        },
        visible: true,
      },
      {
        key: 'copy' as const,
        icon: (<Text style={{ fontSize: 16 }}>📋</Text>),
        onPress: async () => {
          try {
            await Clipboard.setStringAsync(message.text || '');
          } finally {
            close();
          }
        },
        visible: true,
      },
      {
        key: 'delete' as const,
        icon: (<Text style={{ fontSize: 16 }}>🗑️</Text>),
        onPress: () => {
          try {
            removeMessage?.(message.id);
          } finally {
            close();
          }
        },
        visible: true,
      },
    ];
  }, [close, removeMessage]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted={true}
        removeClippedSubviews={true}
        windowSize={10}
        maxToRenderPerBatch={10}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
      />
      
      <ReactionBar
        visible={visible}
        anchor={anchor}
        onClose={close}
        selectedMessageId={selectedMessageId}
        getActions={getActions}
      />
    </View>
  );
};

export default ChatListWithReactions;
