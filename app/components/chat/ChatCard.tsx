// Phase 5 — progressive avatar / batched unread / incremental mount
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { UNREAD_HIGHLIGHT_COLOR_ALPHA, UNREAD_HIGHLIGHT_MS } from '../../lib/avatar/config';
import { ChatListItem } from '../../types/chat';
import { formatChatTime } from '../../utils/time';
import { Avatar } from '../common/Avatar';

interface ChatCardProps {
  item: ChatListItem;
  onPress: (item: ChatListItem) => void;
  shouldHighlight?: boolean; // from ChatList batched highlight system
}

const ROW_HEIGHT = 76;

const ChatCard: React.FC<ChatCardProps> = React.memo(({ item, onPress, shouldHighlight = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(item.unreadCount > 0 ? 1 : 0)).current;
  const badgeOpacity = useRef(new Animated.Value(item.unreadCount > 0 ? 1 : 0)).current;
  const highlightOpacity = useRef(new Animated.Value(0)).current;
  const prevUnreadCount = useRef(item.unreadCount);

  // Unread highlight animation
  useEffect(() => {
    if (shouldHighlight) {
      Animated.sequence([
        Animated.timing(highlightOpacity, {
          toValue: 1,
          duration: UNREAD_HIGHLIGHT_MS / 2,
          useNativeDriver: true,
        }),
        Animated.timing(highlightOpacity, {
          toValue: 0,
          duration: UNREAD_HIGHLIGHT_MS / 2,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shouldHighlight, highlightOpacity]);

  // Анимация badge при изменении unreadCount
  useEffect(() => {
    const hasUnread = item.unreadCount > 0;
    const hadUnread = prevUnreadCount.current > 0;
    
    if (hasUnread && !hadUnread) {
      // Показываем badge
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!hasUnread && hadUnread) {
      // Скрываем badge
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    prevUnreadCount.current = item.unreadCount;
  }, [item.unreadCount, badgeScale, badgeOpacity]);

  const handlePress = () => onPress(item);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const getInitials = (title: string) => {
    return title.charAt(0).toUpperCase();
  };

  const isAIAssistant = item.chatId === 'ai-assistant';

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
    >
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        {/* Unread highlight overlay */}
        <Animated.View 
          style={[
            styles.highlightOverlay,
            { opacity: highlightOpacity }
          ]} 
        />
        
        {isAIAssistant ? (
          <View style={styles.avatar}>
            <Ionicons name="sparkles" size={24} color="#6c5ce7" />
          </View>
        ) : (
          <Avatar
            id={item.chatId}
            size={48}
            name={item.title}
            imageURL={item.avatar ?? null}
          />
        )}

        <View style={styles.chatInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.time}>
              {item.lastMessageTs ? formatChatTime(item.lastMessageTs) : ''}
            </Text>
          </View>
          
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessageText || 'Нет сообщений'}
            </Text>
            
            <Animated.View 
              style={[
                styles.badge,
                {
                  transform: [{ scale: badgeScale }],
                  opacity: badgeOpacity,
                }
              ]}
            >
              <Text style={styles.badgeText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    height: ROW_HEIGHT,
    backgroundColor: '#1a1a2e',
  },
  pressed: {
    backgroundColor: '#2a2a3e',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  highlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(108, 92, 231, ${UNREAD_HIGHLIGHT_COLOR_ALPHA})`,
    zIndex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  time: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
    marginRight: 8,
    fontFamily: 'Poppins-Regular',
  },
  badge: {
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default ChatCard;
