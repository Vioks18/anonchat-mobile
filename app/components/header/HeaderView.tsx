// Extracted verbatim from Header.tsx on 2025-01-27 (lines 1-257)
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Text, TextInput, TouchableOpacity } from 'react-native';

interface HeaderViewProps {
  isSearching: boolean;
  searchQuery: string;
  selectedMessages: Set<string>;
  showMenu: boolean;
  themedStyles: any;
  styles: any;
  headerStyle: any;
  searchContainerStyle: any;
  headerButtonsStyle: any;
  onMenuToggle: () => void;
  onSearchClose: () => void;
  onSearchChange: (text: string) => void;
  onDelete: () => void;
  onCopy: () => void;
  onReply: () => void;
  onCancelSelection: () => void;
}

export const HeaderView: React.FC<HeaderViewProps> = React.memo(({
  isSearching,
  searchQuery,
  selectedMessages,
  showMenu,
  themedStyles,
  styles,
  headerStyle,
  searchContainerStyle,
  headerButtonsStyle,
  onMenuToggle,
  onSearchClose,
  onSearchChange,
  onDelete,
  onCopy,
  onReply,
  onCancelSelection,
}) => {
  try {
    return (
      <Animated.View style={headerStyle}>
        {!isSearching ? (
          <>
            <Text style={themedStyles.headerText}>Axora</Text>
            {selectedMessages.size === 0 && (
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={onMenuToggle}
                activeOpacity={0.7}
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Animated.View style={searchContainerStyle}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Поиск сообщений..."
              placeholderTextColor="#888"
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.searchCloseButton}
              onPress={onSearchClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}
        {selectedMessages.size > 0 && (
          <Animated.View style={headerButtonsStyle}>
            <TouchableOpacity 
              style={styles.headerButton} 
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={20} color="#ff4757" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={onCopy}
              activeOpacity={0.7}
            >
              <Ionicons name="copy" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={onReply}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-undo" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={onCancelSelection}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    );
  } catch (error) {
    if (__DEV__) console.error('Header: Ошибка рендеринга', error);
    return null;
  }
});

HeaderView.displayName = 'HeaderView';
