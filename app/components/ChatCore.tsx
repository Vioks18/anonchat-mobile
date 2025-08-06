import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEMES } from '../constants/themes';
import { useMessageStore } from '../hooks/useMessageStore';
import { ChatInput } from './ChatInput';
import { ChatList } from './ChatList';

interface ChatCoreProps {
  // Минимальные пропсы для изоляции
  onSendMessage?: (text: string) => void;
  onError?: (error: Error) => void;
  isBotEnabled?: boolean;
  onToggleBot?: () => void;
}

export const ChatCore: React.FC<ChatCoreProps> = React.memo(({ onSendMessage, onError, isBotEnabled = false, onToggleBot }) => {
  // Подключаем Zustand store для сообщений
  const messages = useMessageStore((s) => s.messages);
  const addMessage = useMessageStore((s) => s.addMessage);
  
  // Отфильтрованные сообщения для правильного порядка (при inverted={true} нужен обратный порядок)
  const filteredMessages = useMemo(() => {
    try {
      return [...messages].reverse();
    } catch (error) {
      console.error('ChatCore: Ошибка фильтрации сообщений', error);
      return [];
    }
  }, [messages]);
  
  // Состояния для тем
  const [currentTheme, setCurrentTheme] = useState("dark");

  // Применение текущей темы - оптимизировано с useMemo
  const currentThemeData = useMemo(() => {
    try {
      return THEMES[currentTheme as keyof typeof THEMES] || THEMES.dark;
    } catch (error) {
      console.error('ChatCore: Ошибка получения темы', error);
      return THEMES.dark;
    }
  }, [currentTheme]);

  const [inputText, setInputText] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  // Создаем themedStyles для передачи в компоненты
  const themedStyles = useMemo(() => ({
    safe: { backgroundColor: currentThemeData.bg },
    header: { backgroundColor: currentThemeData.headerBg },
    headerText: { color: currentThemeData.text },
    bubbleMe: { backgroundColor: currentThemeData.accent },
    bubbleOther: { backgroundColor: currentThemeData.bubbleOther },
    bubbleText: { color: currentThemeData.text },
    timestamp: { color: currentThemeData.text },
    statusDelivered: { color: currentThemeData.text },
    statusRead: { color: currentThemeData.accent },
    inputContainer: { backgroundColor: currentThemeData.inputBg, marginBottom: keyboardHeight },
    input: { color: currentThemeData.text, backgroundColor: currentThemeData.inputBg },
    sendButton: { backgroundColor: currentThemeData.accent },
  }), [currentThemeData, keyboardHeight]);
  
  // UI WatchDog для мониторинга стабильности (пока отключен)
  // const { status: watchDogStatus } = useUIWatchDog({
  //   flatListRef: { current: null } as any, // Временное решение
  //   messageCount: messages.length,
  //   keyboardHeight,
  //   inputFocused,
  //   onScrollToEnd: () => {
  //     // Скролл теперь обрабатывается в ChatList
  //   },
  // });

  // Безопасная обработка ошибок - мемоизирована
  const safeExecute = useCallback((fn: () => void, errorMessage: string) => {
    try {
      fn();
    } catch (error) {
      console.error(`ChatCore Error: ${errorMessage}`, error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Безопасная установка состояния - мемоизирована
  const safeSetState = useCallback((setter: (value: any) => void, value: any, errorMessage: string) => {
    try {
      setter(value);
    } catch (error) {
      console.error(`ChatCore: ${errorMessage}`, error);
      onError?.(error as Error);
    }
  }, [onError]);

  // Обработка клавиатуры для Android - мемоизирована
  useEffect(() => {
    let keyboardDidShowListener: any = null;
    let keyboardDidHideListener: any = null;

    try {
      keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
        try {
          if (e && e.endCoordinates) {
            setKeyboardHeight(e.endCoordinates.height);
          }
        } catch (error) {
          console.error('ChatCore: Ошибка обработки keyboardDidShow', error);
          onError?.(error as Error);
        }
      });

      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        try {
          setKeyboardHeight(0);
        } catch (error) {
          console.error('ChatCore: Ошибка обработки keyboardDidHide', error);
          onError?.(error as Error);
        }
      });

      // console.log('ChatCore: Слушатели клавиатуры добавлены');
    } catch (error) {
      console.error('ChatCore: Ошибка добавления слушателей клавиатуры', error);
      onError?.(error as Error);
    }

    return () => {
      try {
        keyboardDidShowListener?.remove();
        keyboardDidHideListener?.remove();
        // console.log('ChatCore: Слушатели клавиатуры удалены');
      } catch (error) {
        console.error('ChatCore: Ошибка удаления слушателей клавиатуры', error);
      }
    };
  }, [onError]); // Добавляем onError в зависимости

  // Безопасная отправка сообщения - мемоизирована
  const handleSendMessage = useCallback(() => {
    safeExecute(() => {
      // Валидация ввода
      const trimmedText = inputText.trim();
      if (trimmedText === "") return;
      
      // Проверка длины сообщения
      if (trimmedText.length > 1000) {
        console.warn('ChatCore: Сообщение слишком длинное');
        return;
      }
      
      // Проверка на спам (повторяющиеся символы)
      const spamPattern = /(.)\1{10,}/;
      if (spamPattern.test(trimmedText)) {
        console.warn('ChatCore: Обнаружен спам');
        return;
      }

      // Используем addMessage из store
      addMessage(trimmedText);
      safeSetState(setInputText, "", 'очистка inputText');
      
      // Уведомляем внешнюю логику
      onSendMessage?.(trimmedText);
      
      // console.log('ChatCore: Сообщение отправлено', trimmedText);
    }, 'sendMessage');
  }, [inputText, onSendMessage, safeExecute, addMessage, safeSetState]);

  // Безопасная обработка меню - мемоизирована
  const handleMenuToggle = useCallback(() => {
    safeExecute(() => {
      setShowMenu(!showMenu);
      // console.log('ChatCore: Menu toggled', !showMenu);
    }, 'toggleMenu');
  }, [showMenu, safeExecute]);

  // Безопасная обработка поиска
  const handleSearchToggle = useCallback(() => {
    safeExecute(() => {
      setIsSearching(!isSearching);
      setShowMenu(false);
      // console.log('ChatCore: Search toggled', !isSearching);
    }, 'toggleSearch');
  }, [isSearching, safeExecute]);

  // Безопасная обработка тем
  const handleThemeToggle = useCallback(() => {
    safeExecute(() => {
      setShowThemeSelector(!showThemeSelector);
      setShowMenu(false);
      // console.log('ChatCore: Theme selector toggled', !showThemeSelector);
    }, 'toggleThemeSelector');
  }, [showThemeSelector, safeExecute]);

  // Безопасная обработка бота
  const handleBotToggle = useCallback(() => {
    safeExecute(() => {
      onToggleBot?.();
      setShowMenu(false);
      // console.log('ChatCore: Bot toggled');
    }, 'toggleBot');
  }, [onToggleBot, safeExecute]);

  // Безопасная обработка закрытия поиска
  const handleSearchClose = useCallback(() => {
    safeExecute(() => {
      setIsSearching(false);
      setSearchQuery("");
      // console.log('ChatCore: Search closed');
    }, 'closeSearch');
  }, [safeExecute]);

  // Безопасная обработка закрытия тем
  const handleThemeClose = useCallback(() => {
    safeExecute(() => {
      setShowThemeSelector(false);
      // console.log('ChatCore: Theme selector closed');
    }, 'closeThemeSelector');
  }, [safeExecute]);

  // Безопасная обработка выбора темы
  const handleThemeSelect = useCallback((theme: string) => {
    safeExecute(() => {
      setCurrentTheme(theme);
      setShowThemeSelector(false);
      // console.log('ChatCore: Theme selected', theme);
    }, 'selectTheme');
  }, [safeExecute]);

  // Fallback UI при ошибках
  if (!messages) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>Загрузка сообщений...</Text>
        </View>
      </SafeAreaView>
    );
  }

  try {
    return (
      <SafeAreaView style={[styles.container, themedStyles.safe]}>
        <View style={[styles.container, themedStyles.safe]}>
          {/* Заголовок */}
          <View style={[styles.header, themedStyles.header]}>
            {(() => {
              try {
                if (!isSearching) {
                  return (
                    <>
                      <Text style={[styles.headerText, themedStyles.headerText]}>Axora Chat</Text>
                      <TouchableOpacity 
                        style={styles.menuButton}
                        onPress={handleMenuToggle}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                      </TouchableOpacity>
                    </>
                  );
                } else {
                  return (
                    <View style={styles.searchContainer}>
                      <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
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
                    </View>
                  );
                }
              } catch (error) {
                console.error('ChatCore: Ошибка рендеринга header', error);
                // Fallback - простой header
                return (
                  <>
                    <Text style={[styles.headerText, themedStyles.headerText]}>Axora Chat</Text>
                    <TouchableOpacity 
                      style={styles.menuButton}
                      onPress={handleMenuToggle}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                    </TouchableOpacity>
                  </>
                );
              }
            })()}
          </View>

          {/* Список сообщений */}
          <ChatList
            messages={filteredMessages}
            onSendMessage={handleSendMessage}
            onError={onError}
            themedStyles={themedStyles}
            styles={styles}
            currentThemeData={currentThemeData}
          />

          {/* Поле ввода */}
          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={handleSendMessage}
            keyboardHeight={keyboardHeight}
            currentThemeData={currentThemeData}
            inputFocused={inputFocused}
            setInputFocused={setInputFocused}
          />

          {/* Меню */}
          {showMenu && (() => {
            try {
              return (
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
                      onPress={handleSearchToggle}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="search" size={20} color="#fff" />
                      <Text style={styles.menuItemText}>Поиск</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={handleThemeToggle}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="color-palette" size={20} color="#fff" />
                      <Text style={styles.menuItemText}>Темы</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={handleBotToggle}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={isBotEnabled ? "chatbubble" : "chatbubble-outline"} size={20} color="#fff" />
                      <Text style={styles.menuItemText}>
                        {isBotEnabled ? "Отключить бота" : "Включить бота"}
                      </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            } catch (error) {
              console.error('ChatCore: Ошибка рендеринга меню', error);
              return null;
            }
          })()}

          {/* Селектор тем */}
          {showThemeSelector && (() => {
            try {
              return (
                <TouchableOpacity 
                  style={styles.themeOverlay}
                  onPress={handleThemeClose}
                  activeOpacity={1}
                >
                  <TouchableOpacity 
                    style={styles.themeContent}
                    onPress={() => {}}
                    activeOpacity={1}
                  >
                    <Text style={styles.themeTitle}>Выберите тему</Text>
                    {Object.entries(THEMES).map(([key, theme]) => (
                      <TouchableOpacity 
                        key={key}
                        style={[
                          styles.themeOption,
                          currentTheme === key && styles.themeOptionSelected
                        ]}
                        onPress={() => handleThemeSelect(key)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.themePreview, { backgroundColor: theme.bg }]}>
                          <View style={[styles.themePreviewHeader, { backgroundColor: theme.headerBg }]} />
                          <View style={[styles.themePreviewBubble, { backgroundColor: theme.accent }]} />
                        </View>
                        <Text style={styles.themeOptionText}>{theme.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            } catch (error) {
              console.error('ChatCore: Ошибка рендеринга селектора тем', error);
              return null;
            }
          })()}
        </View>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('ChatCore: Критическая ошибка рендеринга', error);
    onError?.(error as Error);
    return (
      <SafeAreaView style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Произошла ошибка. Попробуйте перезапустить приложение.
        </Text>
      </SafeAreaView>
    );
  }
});

ChatCore.displayName = 'ChatCore';

// Изолированные стили - не зависят от внешних тем
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181825',
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 56,
    backgroundColor: "#23234d",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 0,
    shadowColor: "#6c5ce7",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
    zIndex: 100,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
    fontFamily: "SpaceMono",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
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
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  messageMe: {
    justifyContent: 'flex-end',
  },
  messageOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleMe: {
    backgroundColor: '#6c5ce7',
    shadowColor: '#6c5ce7',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleOther: {
    backgroundColor: '#2a2a4a',
    shadowColor: '#2a2a4a',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#282850",
    backgroundColor: "rgba(34,30,60,0.98)",
    shadowColor: "#6c5ce7",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#23234d",
    borderRadius: 16,
    marginRight: 10,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#444",
    fontFamily: "Poppins-Regular",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6c5ce7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6c5ce7",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontSize: 16,
  },
  errorMessage: {
    padding: 8,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderRadius: 8,
    marginVertical: 4,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
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
        width: '100%',
      },
      themePreviewBubble: {
        flex: 1,
        margin: 4,
        borderRadius: 4,
      },
           themeOptionText: {
        flex: 1,
        fontSize: 16,
        color: "#fff",
        fontFamily: "Poppins-Regular",
      },
  themeOverlay: {
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
  themeContent: {
    backgroundColor: "#23234d",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: 300,
    width: '100%',
  },
  themeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 