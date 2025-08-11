// Extracted verbatim from ChatCore.tsx on 2025-08-11 (lines 575-680)
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { THEMES } from '../../constants/themes';

interface ChatMenusProps {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  setIsSearching: (searching: boolean) => void;
  onToggleBot?: () => void;
  isBotEnabled?: boolean;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
}

const ChatMenus: React.FC<ChatMenusProps> = ({
  showMenu,
  setShowMenu,
  setIsSearching,
  setShowThemeSelector,
  onToggleBot,
  isBotEnabled,
  showThemeSelector,
  currentTheme,
  setCurrentTheme,
}) => {
  return (
    <>
      {/* Меню */}
      {showMenu && (
        <TouchableOpacity 
          style={styles.menuOverlay}
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={styles.menuContent}
            onPress={() => {}}
            activeOpacity={1}
          >
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setIsSearching(true);
                setShowMenu(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Поиск сообщений</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowThemeSelector(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="color-palette-outline" size={20} color="#fff" />
              <Text style={styles.menuItemText}>Темы</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                onToggleBot?.();
                setShowMenu(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={isBotEnabled ? "chatbubble" : "chatbubble-outline"} size={20} color="#fff" />
              <Text style={styles.menuItemText}>
                {isBotEnabled ? "Отключить бота" : "Включить бота"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Модальное окно выбора темы */}
      {showThemeSelector && (
        <View style={styles.themeModal}>
          <TouchableOpacity 
            style={styles.themeModalOverlay}
            onPress={() => setShowThemeSelector(false)}
            activeOpacity={1}
          >
            <TouchableOpacity 
              style={styles.themeModalContent}
              onPress={() => {}}
              activeOpacity={1}
            >
              <Text style={styles.themeModalTitle}>Выберите тему</Text>
              {Object.entries(THEMES).map(([key, theme]) => (
                <TouchableOpacity 
                  key={key}
                  style={[
                    styles.themeOption,
                    currentTheme === key && styles.themeOptionSelected
                  ]}
                  onPress={() => {
                    setCurrentTheme(key);
                    setShowThemeSelector(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themePreview, { backgroundColor: theme.bg }]}>
                    <View style={[styles.themePreviewHeader, { backgroundColor: theme.headerBg }]} />
                    <View style={[styles.themePreviewBubble, { backgroundColor: theme.bubbleMe }]} />
                  </View>
                  <Text style={styles.themeOptionText}>{theme.name}</Text>
                  {currentTheme === key && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
  themeModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  themeModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeModalContent: {
    backgroundColor: "#23234d",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: 300,
    width: '100%',
  },
  themeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  themeOptionSelected: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "#6c5ce7",
  },
  themePreview: {
    width: 40,
    height: 30,
    borderRadius: 6,
    marginRight: 12,
    overflow: 'hidden',
  },
  themePreviewHeader: {
    height: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  themePreviewBubble: {
    width: 20,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginLeft: 4,
  },
  themeOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-Regular",
  },
});

export default ChatMenus;
