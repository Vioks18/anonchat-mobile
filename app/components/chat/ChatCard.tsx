import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { ChatListItem } from '../../types/chat';
import { formatChatTime } from '../../utils/time';

interface ChatCardProps {
  item: ChatListItem;
  onPress: (item: ChatListItem) => void;
}

const ROW_HEIGHT = 76;

const ChatCard: React.FC<ChatCardProps> = React.memo(({ item, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(item.unreadCount > 0 ? 1 : 0)).current;
  const badgeOpacity = useRef(new Animated.Value(item.unreadCount > 0 ? 1 : 0)).current;
  const prevUnreadCount = useRef(item.unreadCount);

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
        Platform.OS === 'ios' && pressed && styles.pressed
      ]}
      android_ripple={{ 
        color: 'rgba(108, 92, 231, 0.1)', 
        borderless: false 
      }}
    >
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.avatar}>
          {isAIAssistant ? (
            <Ionicons name="sparkles" size={24} color="#6c5ce7" />
          ) : (
            <Text style={styles.avatarText}>
              {getInitials(item.title)}
            </Text>
          )}
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {item.title}
            </Text>
            {item.lastMessageTs && (
              <Text style={styles.time}>
                {formatChatTime(item.lastMessageTs)}
              </Text>
            )}
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.lastMessage} numberOfLines={1} ellipsizeMode="tail">
              {item.lastMessageText || 'Нет сообщений'}
            </Text>
            <Animated.View 
              style={[
                styles.unreadBadge,
                {
                  opacity: badgeOpacity,
                  transform: [{ scale: badgeScale }],
                }
              ]}
            >
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}, (prevProps, nextProps) => {
  // Кастомный компаратор для оптимизации
  return (
    prevProps.item.chatId === nextProps.item.chatId &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.lastMessageText === nextProps.item.lastMessageText &&
    prevProps.item.lastMessageTs === nextProps.item.lastMessageTs &&
    prevProps.item.unreadCount === nextProps.item.unreadCount &&
    prevProps.item.avatar === nextProps.item.avatar
  );
});

const styles = StyleSheet.create({
  container: {
    height: ROW_HEIGHT,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Poppins-Regular',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
});

export default ChatCard;
