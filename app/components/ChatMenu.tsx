import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ChatMenuProps {
  showMenu: boolean;
  isSearching: boolean;
  searchQuery: string;
  showThemeSelector: boolean;
  isBotEnabled: boolean;
  onMenuToggle: () => void;
  onSearchToggle: () => void;
  onSearchClose: () => void;
  onSearchChange: (text: string) => void;
  onThemeToggle: () => void;
  onBotToggle: () => void;
  themedStyles: {
    header: any;
    headerText: any;
  };
}

const ChatMenuInner: React.FC<ChatMenuProps> = React.memo(({
  showMenu,
  isSearching,
  searchQuery,
  showThemeSelector,
  isBotEnabled,
  onMenuToggle,
  onSearchToggle,
  onSearchClose,
  onSearchChange,
  onThemeToggle,
  onBotToggle,
  themedStyles
}) => {
  const handleMenuToggle = useCallback(() => {
    try {
      onMenuToggle();
    } catch (error) {
      if (__DEV__) console.error('ChatMenu: Ошибка переключения меню', error);
    }
  }, [onMenuToggle]);

  const handleSearchToggle = useCallback(() => {
    try {
      onSearchToggle();
    } catch (error) {
      if (__DEV__) console.error('ChatMenu: Ошибка переключения поиска', error);
    }
  }, [onSearchToggle]);

  const handleThemeToggle = useCallback(() => {
    try {
      onThemeToggle();
    } catch (error) {
      if (__DEV__) console.error('ChatMenu: Ошибка переключения тем', error);
    }
  }, [onThemeToggle]);

  const handleBotToggle = useCallback(() => {
    try {
      onBotToggle();
    } catch (error) {
      if (__DEV__) console.error('ChatMenu: Ошибка переключения бота', error);
    }
  }, [onBotToggle]);

  return (
    <>
      <View style={[styles.header, themedStyles.header]}>
        {!isSearching ? (
          <>
            <Text style={[styles.headerText, themedStyles.headerText]}>Axora Chat</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuToggle}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.searchContainer}>
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
          </View>
        )}
      </View>

      {/* Модальное окно меню */}
      {showMenu && (
        <TouchableOpacity 
          style={styles.menuOverlay}
          onPress={handleMenuToggle}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={styles.menuContent}
            onPress={() => {}}
            activeOpacity={1}
          >
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleSearchToggle}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Поиск сообщений</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleThemeToggle}
              activeOpacity={0.7}
            >
              <Ionicons name="color-palette-outline" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Темы</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleBotToggle}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isBotEnabled ? "chatbubble" : "chatbubble-outline"} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.menuItemText}>
                {isBotEnabled ? "Отключить бота" : "Включить бота"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </>
  );
});

ChatMenuInner.displayName = 'ChatMenu';

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
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  menuContent: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: "#23234d",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    marginRight: 8,
  },
  searchCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

});

// Экспортируем как default для Expo Router
export default ChatMenuInner;

// Также экспортируем как named export для обратной совместимости
export const ChatMenu = ChatMenuInner;
