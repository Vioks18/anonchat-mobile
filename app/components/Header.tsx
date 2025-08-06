import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Animated, Text, TextInput, TouchableOpacity } from 'react-native';

interface HeaderProps {
  isSearching: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsSearching: (searching: boolean) => void;
  selectedMessages: Set<string>;
  setShowMenu: (show: boolean) => void;
  showMenu: boolean;
  headerAnimation: Animated.Value;
  searchAnimation: Animated.Value;
  selectionAnimation: Animated.Value;
  themedStyles: any;
  styles: any;
  deleteMessage: (messageId: string) => void;
  copyMessage: (messageId: string) => void;
  replyToMessage: (messageId: string) => void;
  setSelectedMessages: (messages: Set<string>) => void;
  setShowReactions: (reactions: string | null) => void;
  setShowDeleteOptions: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSearching,
  searchQuery,
  setSearchQuery,
  setIsSearching,
  selectedMessages,
  setShowMenu,
  showMenu,
  headerAnimation,
  searchAnimation,
  selectionAnimation,
  themedStyles,
  styles,
  deleteMessage,
  copyMessage,
  replyToMessage,
  setSelectedMessages,
  setShowReactions,
  setShowDeleteOptions,
}) => {
  // Безопасная обработка меню
  const handleMenuToggle = useCallback(() => {
    try {
      setShowMenu(!showMenu);
    } catch (error) {
      console.error('Header: Ошибка переключения меню', error);
    }
  }, [showMenu, setShowMenu]);

  // Безопасная обработка поиска
  const handleSearchClose = useCallback(() => {
    try {
      setIsSearching(false);
      setSearchQuery("");
      Animated.spring(searchAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } catch (error) {
      console.error('Header: Ошибка закрытия поиска', error);
    }
  }, [setIsSearching, setSearchQuery, searchAnimation]);

  // Безопасная обработка удаления
  const handleDelete = useCallback(() => {
    try {
      const messageId = Array.from(selectedMessages)[0];
      if (messageId) {
        deleteMessage(messageId);
      }
    } catch (error) {
      console.error('Header: Ошибка удаления сообщения', error);
    }
  }, [selectedMessages, deleteMessage]);

  // Безопасная обработка копирования
  const handleCopy = useCallback(() => {
    try {
      const messageId = Array.from(selectedMessages)[0];
      if (messageId) {
        copyMessage(messageId);
      }
    } catch (error) {
      console.error('Header: Ошибка копирования сообщения', error);
    }
  }, [selectedMessages, copyMessage]);

  // Безопасная обработка ответа
  const handleReply = useCallback(() => {
    try {
      const messageId = Array.from(selectedMessages)[0];
      if (messageId) {
        replyToMessage(messageId);
      }
    } catch (error) {
      console.error('Header: Ошибка ответа на сообщение', error);
    }
  }, [selectedMessages, replyToMessage]);

  // Безопасная обработка отмены выбора
  const handleCancelSelection = useCallback(() => {
    try {
      setSelectedMessages(new Set());
      setShowReactions(null);
      setShowDeleteOptions(false);
    } catch (error) {
      console.error('Header: Ошибка отмены выбора', error);
    }
  }, [setSelectedMessages, setShowReactions, setShowDeleteOptions]);

  // Безопасная обработка изменения поиска
  const handleSearchChange = useCallback((text: string) => {
    try {
      if (typeof text === 'string') {
        setSearchQuery(text);
      } else {
        console.warn('Header: Невалидный тип текста поиска', typeof text);
      }
    } catch (error) {
      console.error('Header: Ошибка изменения поиска', error);
    }
  }, [setSearchQuery]);

  try {
    return (
      <Animated.View 
        style={[
          themedStyles.header,
          {
            transform: [{
              translateY: headerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10],
              })
            }],
            opacity: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.8],
            })
          }
        ]}
      >
        {!isSearching ? (
          <>
            <Text style={themedStyles.headerText}>Axora</Text>
            {selectedMessages.size === 0 && (
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={handleMenuToggle}
                activeOpacity={0.7}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Animated.View 
            style={[
              styles.searchContainer,
              {
                transform: [{
                  scaleX: searchAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }],
                opacity: searchAnimation
              }
            ]}
          >
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholder="Поиск сообщений..."
              placeholderTextColor="#888"
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.searchCloseButton}
              onPress={handleSearchClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}
        {selectedMessages.size > 0 && (
          <Animated.View 
            style={[
              styles.headerButtons,
              {
                transform: [{
                  scale: selectionAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }],
                opacity: selectionAnimation
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={20} color="#ff4757" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleCopy}
              activeOpacity={0.7}
            >
              <Ionicons name="copy" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleReply}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-undo" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleCancelSelection}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    );
  } catch (error) {
    console.error('Header: Ошибка рендеринга', error);
    return null;
  }
}; 