import React from 'react';
import { Animated } from 'react-native';
import { useHeaderLogic } from '../hooks/chat/useHeaderLogic';
import { HeaderView } from './header/HeaderView';

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

const HeaderInner: React.FC<HeaderProps> = React.memo(({
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
  const {
    headerStyle,
    searchContainerStyle,
    headerButtonsStyle,
    handleMenuToggle,
    handleSearchClose,
    handleDelete,
    handleCopy,
    handleReply,
    handleCancelSelection,
    handleSearchChange,
  } = useHeaderLogic({
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
  });

  return (
    <HeaderView
      isSearching={isSearching}
      searchQuery={searchQuery}
      selectedMessages={selectedMessages}
      showMenu={showMenu}
      themedStyles={themedStyles}
      styles={styles}
      headerStyle={headerStyle}
      searchContainerStyle={searchContainerStyle}
      headerButtonsStyle={headerButtonsStyle}
      onMenuToggle={handleMenuToggle}
      onSearchClose={handleSearchClose}
      onSearchChange={handleSearchChange}
      onDelete={handleDelete}
      onCopy={handleCopy}
      onReply={handleReply}
      onCancelSelection={handleCancelSelection}
    />
  );
});

HeaderInner.displayName = 'Header';

// Экспортируем как default для Expo Router
export default HeaderInner;

// Также экспортируем как named export для обратной совместимости
export const Header = HeaderInner; 