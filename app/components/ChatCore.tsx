/**
 * ⚠️  ВАЖНО: НЕ ТРОГАТЬ ЭТОТ ФАЙЛ! ⚠️
 * 
 * ChatCore.tsx - СТАБИЛЬНАЯ ВЕРСИЯ
 * 
 * 🚫 НЕ ДОБАВЛЯТЬ:
 * - Сложную функциональность
 * - Новые состояния
 * - Дополнительные компоненты
 * 
 * ✅ РАБОТАЕТ:
 * - Отправка сообщений
 * - Отображение сообщений
 * - Темы
 * - Защитная система
 * 
 * 📝 ПРАВИЛА:
 * 1. Только исправление критических багов
 * 2. Никаких новых фич
 * 3. Сохранять стабильность
 * 
 * 🔒 ЗАЩИЩЕНО ОТ ИЗМЕНЕНИЙ
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageStore } from '../hooks/useMessageStore';

import * as Clipboard from 'expo-clipboard';
import { ErrorSeverity, useErrorMonitor } from '../utils/errorBoundary';
import ChatListWithReactions from './ChatListWithReactions';

// Extracted components
import useKeyboardGlue from '../hooks/chat/useKeyboardGlue';
import { ChatMenus, HeaderBar, InputBar } from './chat';
import { THEMES } from '../constants/themes';

interface ChatCoreProps {
  // Минимальные пропсы для изоляции
  onSendMessage?: (text: string) => void;
  onError?: (error: Error) => void;
  isBotEnabled?: boolean;
  onToggleBot?: () => void;
}

// Fallback компонент для критических ошибок
const ChatCoreFallback: React.FC<{ error?: string }> = ({ error }) => (
  <SafeAreaView style={styles.fallbackContainer}>
    <View style={styles.fallbackContent}>
      <Ionicons name="warning" size={48} color="#ff6b6b" />
      <Text style={styles.fallbackTitle}>Ошибка приложения</Text>
      <Text style={styles.fallbackText}>
        {error || "Произошла критическая ошибка. Попробуйте перезапустить приложение."}
      </Text>
      <TouchableOpacity 
        style={styles.fallbackButton}
        onPress={() => {
          // Попытка перезагрузки
          if (__DEV__) console.log('ChatCore: Попытка перезагрузки...');
        }}
      >
        <Text style={styles.fallbackButtonText}>Перезапустить</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

// Функция для получения цвета тени в зависимости от темы
const getShadowColor = (theme: any, isMe: boolean) => {
  if (isMe) {
    return theme.bubbleMe;
  } else {
    return theme.bubbleOther;
  }
};

const ChatCoreInner: React.FC<ChatCoreProps> = ({ onSendMessage, onError, isBotEnabled = false, onToggleBot }) => {
  // Используем систему мониторинга ошибок
  const { addError, getStats, isStable } = useErrorMonitor();
  
  // Ref для TextInput
  const textInputRef = useRef<TextInput>(null);
  
  // Состояние для отслеживания критических ошибок
  const [hasCriticalError, setHasCriticalError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Подключаем Zustand store для сообщений с защитой
  const messages = useMessageStore((s) => (s?.messages || []).filter(msg => !msg.deletedFor?.["me"]));
  const addMessage = useMessageStore((s) => s?.addMessage || (() => {}));
  const removeMessage = useMessageStore((s) => s?.removeMessage || (() => {}));
  const setReplyDraft = useMessageStore((s) => s?.setReplyDraft || (() => {}));
  const getMessageById = useMessageStore((s) => s?.getMessageById || (() => undefined));
  const deleteForMe = useMessageStore((s) => s?.deleteForMe || (() => {}));
  const requestDeleteForAll = useMessageStore((s) => s?.requestDeleteForAll || (() => Promise.resolve()));
  
  // Получаем выбранное сообщение для действий
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessagesCount, setSelectedMessagesCount] = useState(0);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  
  // Состояние для input
  const [inputText, setInputText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  
  // Автоматический скролл к концу текста при изменении
  useEffect(() => {
    if (textInputRef.current && inputText.length > 0) {
      setTimeout(() => {
        textInputRef.current?.setNativeProps({
          selection: { start: inputText.length, end: inputText.length }
        });
      }, 100);
    }
  }, [inputText]);

  // Синхронизация с store
  useEffect(() => {
    const unsubscribe = useMessageStore.subscribe((state) => {
      setSelectedMessages(state.selectedIds);
      setSelectedMessagesCount(state.selectedIds.size);
    });
    
    return unsubscribe;
  }, []);

  // Функции для действий с сообщениями
  const handleReply = useCallback(() => {
    if (selectedMessageId) {
      const message = getMessageById(selectedMessageId);
      if (message) {
        setReplyDraft(message);
        setSelectedMessageId(null);
      }
    }
  }, [selectedMessageId, getMessageById, setReplyDraft]);
  
  const handleCopy = useCallback(async () => {
    if (selectedMessageId) {
      const message = getMessageById(selectedMessageId);
      if (message) {
        try {
          await Clipboard.setStringAsync(message.text);
          setSelectedMessageId(null);
        } catch (error) {
          if (__DEV__) console.warn('Ошибка копирования:', error);
        }
      }
    }
  }, [selectedMessageId, getMessageById]);
  
  const handleForward = useCallback(() => {
    if (__DEV__) console.warn('Forward: TODO - пока не реализовано');
    setSelectedMessageId(null);
  }, []);
  
  const handleDelete = useCallback(() => {
    if (selectedMessageId) {
      removeMessage(selectedMessageId);
      setSelectedMessageId(null);
    }
  }, [selectedMessageId, removeMessage]);

  // Функции для работы с множественными сообщениями
  const handleCopySelected = useCallback(async () => {
    const selectedTexts = Array.from(selectedMessages).map(id => {
      const message = getMessageById(id);
      return message?.text || '';
    }).filter(text => text.length > 0);
    
    if (selectedTexts.length > 0) {
      try {
        await Clipboard.setStringAsync(selectedTexts.join('\n\n'));
        // Очищаем выбор после копирования
        const clearSelection = useMessageStore.getState().clearSelection;
        clearSelection();
        setSelectedMessages(new Set());
        setSelectedMessagesCount(0);
      } catch (error) {
        if (__DEV__) console.warn('Ошибка копирования множественных сообщений:', error);
      }
    }
  }, [selectedMessages, getMessageById]);

  const handleDeleteForMe = useCallback(() => {
    const selectedIds = Array.from(selectedMessages);
    deleteForMe(selectedIds);
    setShowDeleteMenu(false);
    // Selection is cleared automatically by deleteForMe
  }, [selectedMessages, deleteForMe]);

  const handleDeleteForAll = useCallback(async () => {
    // Only allow delete for all on my messages
    const myMessages = Array.from(selectedMessages).filter(id => {
      const message = getMessageById(id);
      return message?.sender === 'me';
    });
    
    if (myMessages.length > 0) {
      try {
        await requestDeleteForAll(myMessages);
        setShowDeleteMenu(false);
        // Selection is cleared automatically by requestDeleteForAll
      } catch (error) {
        if (__DEV__) console.error('handleDeleteForAll: Ошибка удаления сообщений', error);
      }
    }
  }, [selectedMessages, getMessageById, requestDeleteForAll]);

  // Legacy handler for backward compatibility
  const handleDeleteSelected = useCallback(() => {
    handleDeleteForMe();
  }, [handleDeleteForMe]);
  
  // Состояния для тем с защитой
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  
  // Состояния для меню
  const [showMenu, setShowMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const flatListRef = useRef<FlatList>(null); // Пустой ref для совместимости
  
  // Keyboard glue hook
  const {
    keyboardHeight,
    keyboardAnimation,
    watchDogStatus,
    updateScrollPosition,
    forceCheck,
  } = useKeyboardGlue({
    flatListRef,
    messageCount: messages.length,
    inputFocused,
    onError,
  });

  // Применение текущей темы с защитой
  const currentThemeData = React.useMemo(() => {
    try {
      return THEMES[currentTheme as keyof typeof THEMES] || THEMES.dark;
    } catch (error) {
      addError(error instanceof Error ? error : new Error(String(error)), 'ChatCore', ErrorSeverity.MEDIUM);
      return THEMES.dark;
    }
  }, [currentTheme, addError]);
  
  // Отфильтрованные сообщения с поиском и правильным порядком
  const filteredMessages = React.useMemo(() => {
    try {
      if (!Array.isArray(messages)) {
        addError(new Error('messages не является массивом'), 'ChatCore', ErrorSeverity.MEDIUM);
        return [];
      }

      let filtered = [...messages];

      // Применяем поиск если есть запрос
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(message => 
          message.text.toLowerCase().includes(query)
        );
      }

      // Возвращаем в обратном порядке для inverted FlatList
      return filtered.reverse();
    } catch (error) {
      addError(error instanceof Error ? error : new Error(String(error)), 'ChatCore', ErrorSeverity.HIGH);
      return [];
    }
  }, [messages, searchQuery, addError]);

  // Улучшенная безопасная обработка ошибок
  const safeExecute = useCallback((fn: () => void, errorMessage: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM) => {
    try {
      fn();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      addError(errorObj, 'ChatCore', severity);
      
      // Проверяем на критические ошибки
      if (severity === ErrorSeverity.CRITICAL || errorObj.message.includes('critical')) {
        setHasCriticalError(true);
        setErrorMessage(errorObj.message);
      }
      
      onError?.(errorObj);
    }
  }, [onError, addError]);



  // Безопасная отправка сообщения
  const handleSendMessage = useCallback(() => {
    safeExecute(() => {
      if (inputText.trim() === "") return;

      // Проверяем, не является ли это командой DevBot
      if (inputText.trim().startsWith('/')) {
        // Команда DevBot - передаем внешней логике
        onSendMessage?.(inputText.trim());
        setInputText("");
        return;
      }

      // Используем addMessage из store
      addMessage(inputText.trim());
      setInputText("");
      
      // Уведомляем внешнюю логику
      onSendMessage?.(inputText.trim());
      
      // Безопасный скролл вниз (при inverted={true} это scrollToOffset)
      setTimeout(() => {
        safeExecute(() => {
          // flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); // This line is removed
        }, 'scrollToEnd', ErrorSeverity.LOW);
      }, 100);
    }, 'sendMessage', ErrorSeverity.MEDIUM);
  }, [inputText, onSendMessage, safeExecute, addMessage]);

  // Критическая ошибка - показываем fallback
  if (hasCriticalError) {
    return <ChatCoreFallback error={errorMessage} />;
  }

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentThemeData.bg }]} edges={["top", "bottom"]}>
      <View style={styles.flex}>
        {/* Header */}
        {selectedMessagesCount > 0 ? (
          // Верхняя панель действий в режиме выбора
          <View style={[styles.header, { backgroundColor: currentThemeData.headerBg }]}>
            <View style={styles.selectionHeader}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => {
                  // Очищаем выбор через store
                  const clearSelection = useMessageStore.getState().clearSelection;
                  clearSelection();
                  setSelectedMessageId(null);
                  setSelectedMessagesCount(0);
                  setSelectedMessages(new Set());
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.selectionCount}>{selectedMessagesCount} выбрано</Text>
            </View>
            <View style={styles.headerActions}>
              {selectedMessagesCount === 1 && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleReply}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-undo" size={18} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleCopySelected}
                activeOpacity={0.7}
              >
                <Ionicons name="copy" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleForward}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  console.log('🗑️ Открываю меню удаления');
                  setShowDeleteMenu(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <HeaderBar
            isSearching={isSearching}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setIsSearching={setIsSearching}
            selectedMessageId={selectedMessageId}
            handleReply={handleReply}
            handleCopy={handleCopy}
            handleForward={handleForward}
            handleDelete={handleDelete}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            currentThemeData={currentThemeData}
          />
        )}

        {/* Меню */}
        <ChatMenus
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          setIsSearching={setIsSearching}
          setShowThemeSelector={setShowThemeSelector}
          onToggleBot={onToggleBot}
          isBotEnabled={isBotEnabled}
          showThemeSelector={showThemeSelector}
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
        />

                 {/* Список сообщений - критически важный компонент */}
         <ChatListWithReactions
          messages={filteredMessages}
          onScrollBeginDrag={() => {
            // Обработка начала скролла
          }}
          onMessageSelected={setSelectedMessageId}
          onSelectionChange={setSelectedMessagesCount}
          onSelectedMessagesChange={setSelectedMessages}
        />

        {/* Строка ввода - критически важный компонент */}
        <InputBar
          inputText={inputText}
          setInputText={setInputText}
          handleSendMessage={handleSendMessage}
          keyboardHeight={keyboardHeight}
          currentThemeData={currentThemeData}
          setInputFocused={setInputFocused}
        />
        
        {/* Реакции теперь обрабатываются в ChatListWithReactions */}
      </View>
      
      {/* DevHUD для отображения статуса WatchDog (временно отключен) */}
      {/* <DevHUD status={watchDogStatus} /> */}
      
      {/* Delete Menu */}
      {showDeleteMenu && (() => {
        console.log('🗑️ Рендерю меню удаления');
        return true;
      })() && (
        <View style={styles.deleteMenuOverlay}>
          <TouchableOpacity 
            style={styles.deleteMenuOverlayBackground}
            onPress={() => setShowDeleteMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.deleteMenuContent}>
            <TouchableOpacity 
              style={styles.deleteMenuOption}
              onPress={handleDeleteForMe}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.deleteMenuText}>Удалить у себя</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteMenuOption}
              onPress={handleDeleteForAll}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={20} color="#ff6b6b" />
              <Text style={styles.deleteMenuText}>Удалить у всех</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

// Экспортируем как default для Expo Router
export default ChatCoreInner;

// Также экспортируем как named export для обратной совместимости
export const ChatCore = ChatCoreInner;

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
    borderBottomWidth: 0,
    shadowColor: "#6c5ce7",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
    fontFamily: "SpaceMono",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
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
    shadowOpacity: 0.2, // Уменьшил с 0.25 до 0.2
    shadowRadius: 6, // Уменьшил с 8 до 6
    shadowOffset: { width: 0, height: 2 }, // Добавил смещение
    elevation: 3, // Уменьшил с 4 до 3
  },
  bubbleOther: {
    backgroundColor: '#2a2a4a',
    shadowColor: '#2a2a4a',
    shadowOpacity: 0.1, // Уменьшил с 0.12 до 0.1
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, // Добавил смещение
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22, // Увеличил с 20 до 22 для лучшего отображения
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
    maxHeight: 120, // Ограничиваем высоту чтобы не доходила до верхней панели
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
    backgroundColor: '#181825',
  },
  fallbackContent: {
    alignItems: 'center',
    padding: 20,
  },
  fallbackTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  fallbackText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  fallbackButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  highlightedMessage: {
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)', // Тонкая синяя граница
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMessage: {
    // Полностью убираю стили выделения
  },
  selectedBubble: {
    // Полностью убираю стили выделения
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectionCount: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  deleteMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  deleteMenuOverlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  deleteMenuContent: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#23234d",
    borderRadius: 12,
    padding: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  deleteMenuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteMenuText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },
}); 