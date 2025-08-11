// Extracted verbatim from Header.tsx on 2025-01-27 (lines 1-257)
import { useCallback, useMemo } from 'react';
import { Animated } from 'react-native';

interface UseHeaderLogicProps {
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

export function useHeaderLogic({
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
}: UseHeaderLogicProps) {
  // Мемоизированные стили анимации
  const headerStyle = useMemo(() => [
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
  ], [themedStyles.header, headerAnimation]);

  const searchContainerStyle = useMemo(() => [
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
  ], [styles.searchContainer, searchAnimation]);

  const headerButtonsStyle = useMemo(() => [
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
  ], [styles.headerButtons, selectionAnimation]);

  // Безопасная обработка меню
  const handleMenuToggle = useCallback(() => {
    try {
      setShowMenu(!showMenu);
    } catch (error) {
      if (__DEV__) console.error('Header: Ошибка переключения меню', error);
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
      if (__DEV__) console.error('Header: Ошибка закрытия поиска', error);
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
      if (__DEV__) console.error('Header: Ошибка удаления сообщения', error);
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
      if (__DEV__) console.error('Header: Ошибка копирования сообщения', error);
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
      if (__DEV__) console.error('Header: Ошибка ответа на сообщение', error);
    }
  }, [selectedMessages, replyToMessage]);

  // Безопасная обработка отмены выбора
  const handleCancelSelection = useCallback(() => {
    try {
      setSelectedMessages(new Set());
      setShowReactions(null);
      setShowDeleteOptions(false);
    } catch (error) {
      if (__DEV__) console.error('Header: Ошибка отмены выбора', error);
    }
  }, [setSelectedMessages, setShowReactions, setShowDeleteOptions]);

  // Безопасная обработка изменения поиска
  const handleSearchChange = useCallback((text: string) => {
    try {
      if (typeof text === 'string') {
        setSearchQuery(text);
      } else {
        if (__DEV__) console.warn('Header: Невалидный тип текста поиска', typeof text);
      }
    } catch (error) {
      if (__DEV__) console.error('Header: Ошибка изменения поиска', error);
    }
  }, [setSearchQuery]);

  return {
    // Стили анимации
    headerStyle,
    searchContainerStyle,
    headerButtonsStyle,
    // Обработчики
    handleMenuToggle,
    handleSearchClose,
    handleDelete,
    handleCopy,
    handleReply,
    handleCancelSelection,
    handleSearchChange,
  };
}
