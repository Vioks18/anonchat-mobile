import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChatMenuProps {
  showMenu: boolean;
  isSearching: boolean;
  showThemeSelector: boolean;
  isBotEnabled: boolean;
  onMenuToggle: () => void;
  onSearchToggle: () => void;
  onThemeToggle: () => void;
  onBotToggle: () => void;
  themedStyles: {
    header: any;
    headerText: any;
  };
}

export const ChatMenu: React.FC<ChatMenuProps> = React.memo(({
  showMenu,
  isSearching,
  showThemeSelector,
  isBotEnabled,
  onMenuToggle,
  onSearchToggle,
  onThemeToggle,
  onBotToggle,
  themedStyles
}) => {
  const handleMenuToggle = useCallback(() => {
    try {
      onMenuToggle();
    } catch (error) {
      console.error('ChatMenu: Ошибка переключения меню', error);
    }
  }, [onMenuToggle]);

  const handleSearchToggle = useCallback(() => {
    try {
      onSearchToggle();
    } catch (error) {
      console.error('ChatMenu: Ошибка переключения поиска', error);
    }
  }, [onSearchToggle]);

  const handleThemeToggle = useCallback(() => {
    try {
      onThemeToggle();
    } catch (error) {
      console.error('ChatMenu: Ошибка переключения тем', error);
    }
  }, [onThemeToggle]);

  const handleBotToggle = useCallback(() => {
    try {
      onBotToggle();
    } catch (error) {
      console.error('ChatMenu: Ошибка переключения бота', error);
    }
  }, [onBotToggle]);

  if (!showMenu) {
    return (
      <View style={[styles.header, themedStyles.header]}>
        <Text style={[styles.headerText, themedStyles.headerText]}>Axora Chat</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleMenuToggle}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.header, themedStyles.header]}>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuOption, isSearching && styles.activeOption]}
          onPress={handleSearchToggle}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isSearching ? "search" : "search-outline"} 
            size={20} 
            color="#fff" 
          />
          <Text style={[styles.menuText, themedStyles.headerText]}>Поиск</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuOption, showThemeSelector && styles.activeOption]}
          onPress={handleThemeToggle}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={showThemeSelector ? "color-palette" : "color-palette-outline"} 
            size={20} 
            color="#fff" 
          />
          <Text style={[styles.menuText, themedStyles.headerText]}>Темы</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuOption, isBotEnabled && styles.activeOption]}
          onPress={handleBotToggle}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isBotEnabled ? "chatbubble" : "chatbubble-outline"} 
            size={20} 
            color="#fff" 
          />
          <Text style={[styles.menuText, themedStyles.headerText]}>Бот</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleMenuToggle}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

ChatMenu.displayName = 'ChatMenu';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  activeOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuText: {
    marginLeft: 4,
    fontSize: 14,
  },
  closeButton: {
    padding: 8,
    marginLeft: 'auto',
  },
});
