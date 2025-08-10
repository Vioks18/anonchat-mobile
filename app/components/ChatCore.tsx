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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageStore } from '../hooks/useMessageStore';
import { useUIWatchDog } from '../hooks/useUIWatchDog';
import { ErrorSeverity, useErrorMonitor } from '../utils/errorBoundary';
import ChatListWithReactions from './ChatListWithReactions';

import * as Clipboard from 'expo-clipboard';

// Темы
const THEMES = {
  dark: {
    name: "Темная",
    accent: "#6c5ce7",
    bg: "#181825",
    headerBg: "#23234d",
    bubbleMe: "#6c5ce7",
    bubbleOther: "#23234d",
    text: "#fff",
    inputBg: "#23234d",
    border: "#282850",
  },
  ocean: {
    name: "Океан",
    accent: "#00b894",
    bg: "#0a1929",
    headerBg: "#1a3a5f",
    bubbleMe: "#00b894",
    bubbleOther: "#1a3a5f",
    text: "#fff",
    inputBg: "#1a3a5f",
    border: "#2d5a8a",
  },
  sunset: {
    name: "Закат",
    accent: "#e17055",
    bg: "#2d1b1b",
    headerBg: "#4a2c2c",
    bubbleMe: "#e17055",
    bubbleOther: "#4a2c2c",
    text: "#fff",
    inputBg: "#4a2c2c",
    border: "#6b3e3e",
  },
  forest: {
    name: "Лес",
    accent: "#00b894",
    bg: "#0f1a0f",
    headerBg: "#1a3a1a",
    bubbleMe: "#00b894",
    bubbleOther: "#1a3a1a",
    text: "#fff",
    inputBg: "#1a3a1a",
    border: "#2d5a2d",
  },
  purple: {
    name: "Фиолетовая",
    accent: "#a29bfe",
    bg: "#2d1b69",
    headerBg: "#4a2c8a",
    bubbleMe: "#a29bfe",
    bubbleOther: "#4a2c8a",
    text: "#fff",
    inputBg: "#4a2c8a",
    border: "#6b3eb3",
  },
  neon: {
    name: "Неон",
    accent: "#00d2d3",
    bg: "#0a0a0a",
    headerBg: "#1a1a1a",
    bubbleMe: "#00d2d3",
    bubbleOther: "#1a1a1a",
    text: "#fff",
    inputBg: "#1a1a1a",
    border: "#2d2d2d",
  }
};

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
  const messages = useMessageStore((s) => s?.messages || []);
  const addMessage = useMessageStore((s) => s?.addMessage || (() => {}));
  const removeMessage = useMessageStore((s) => s?.removeMessage || (() => {}));
  const setReplyDraft = useMessageStore((s) => s?.setReplyDraft || (() => {}));
  const getMessageById = useMessageStore((s) => s?.getMessageById || (() => undefined));
  
  // Получаем выбранное сообщение для действий
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessagesCount, setSelectedMessagesCount] = useState(0);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  
  // Состояние для input
  const [inputText, setInputText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  
  // Состояния для темы
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Состояние для модального окна удаления
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAction, setDeleteAction] = useState<'forMe' | 'forAll' | null>(null);
  
  // Состояние для принудительного закрытия ReactionBar
  const [forceCloseReactionBar, setForceCloseReactionBar] = useState(false);
  
  // Состояние для отмены удаления
  const [showUndo, setShowUndo] = useState(false);
  const [lastDeletedMessages, setLastDeletedMessages] = useState<string[]>([]);
  const [lastDeleteAction, setLastDeleteAction] = useState<'forMe' | 'forAll' | null>(null);
  
  // Состояния для меню и поиска
  const [showMenu, setShowMenu] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Состояние для клавиатуры
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null); // Пустой ref для совместимости
  
  // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ЗДЕСЬ, ДО ЛЮБЫХ УСЛОВНЫХ RETURN
  
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

  // Сбрасываем флаг после использования
  useEffect(() => {
    if (forceCloseReactionBar) {
      // Сбрасываем флаг через небольшую задержку
      const timer = setTimeout(() => {
        setForceCloseReactionBar(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [forceCloseReactionBar]);

  // Вычисляем данные темы
  const currentThemeData = React.useMemo(() => {
    if (currentTheme && THEMES[currentTheme as keyof typeof THEMES]) {
      return THEMES[currentTheme as keyof typeof THEMES] || THEMES.dark;
    }
    return THEMES.dark;
  }, [currentTheme]);

  // Фильтруем сообщения
  const filteredMessages = React.useMemo(() => {
    if (!messages || messages.length === 0) {
      return [];
    }
    
    if (searchQuery.trim() === '') {
      const filtered = [...messages];
      return filtered.reverse();
    }
    
    const filtered = messages.filter(msg => 
      msg.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.reverse();
  }, [messages, searchQuery]);

  // UI WatchDog - упрощенная версия
  const watchDogResult = useUIWatchDog({
    flatListRef: flatListRef,
    messageCount: filteredMessages.length,
    inputFocused,
    keyboardHeight,
  });

  // Функция безопасного выполнения
  const safeExecute = useCallback((fn: () => void, errorMessage: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM) => {
    try {
      fn();
    } catch (error) {
      addError(new Error(errorMessage), severity);
      if (__DEV__) console.warn(errorMessage, error);
    }
  }, [addError]);

  // Обработка ошибок
  useEffect(() => {
    if (!isStable) {
      setHasCriticalError(true);
      setErrorMessage('Критическая ошибка в системе');
    }
  }, [isStable]);

  // Обработка клавиатуры
  useEffect(() => {
    let keyboardDidShowListener: any;
    let keyboardDidHideListener: any;

    try {
      keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      });

      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardHeight(0);
      });
    } catch (error) {
      if (__DEV__) console.warn('Ошибка обработки клавиатуры:', error);
    }

    return () => {
      try {
        keyboardDidShowListener?.remove();
        keyboardDidHideListener?.remove();
      } catch (error) {
        if (__DEV__) console.warn('Ошибка удаления слушателей клавиатуры:', error);
      }
    };
  }, []);

  // Функция для закрытия ReactionBar
  const closeReactionBar = useCallback(() => {
    // Устанавливаем флаг для принудительного закрытия
    setForceCloseReactionBar(true);
    if (__DEV__) console.log('closeReactionBar вызвана через флаг');
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
        if (__DEV__) console.warn('Ошибка копирования:', error);
      }
    }
  }, [selectedMessages, getMessageById]);

  // Проверяем можно ли удалить для всех
  const canDeleteForAll = useMemo(() => {
    return Array.from(selectedMessages).every(id => {
      const message = getMessageById(id);
      return message?.sender === 'me';
    });
  }, [selectedMessages, getMessageById]);

  // Функции для удаления
  const handleDeleteForMe = useCallback(() => {
    setDeleteAction('forMe');
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteForAll = useCallback(() => {
    setDeleteAction('forAll');
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    const messageIds = Array.from(selectedMessages);
    if (messageIds.length > 0) {
      try {
        const { deleteForMe, deleteForAll } = useMessageStore.getState();
        
        if (deleteAction === 'forMe') {
          deleteForMe(messageIds, 'me');
          
          // Сохраняем для отмены
          setLastDeletedMessages(messageIds);
          setLastDeleteAction(deleteAction);
          setShowUndo(true);
          
          // Автоматически скрываем через 3 секунды
          setTimeout(() => {
            setShowUndo(false);
            setLastDeletedMessages([]);
            setLastDeleteAction(null);
          }, 3000);
        } else if (deleteAction === 'forAll') {
          await deleteForAll(messageIds, 'me');
        }
        
        // Очищаем выбор после удаления
        const clearSelection = useMessageStore.getState().clearSelection;
        clearSelection();
        setSelectedMessages(new Set());
        setSelectedMessagesCount(0);
        
        // Закрываем ReactionBar
        closeReactionBar();
      } catch (error) {
        if (__DEV__) console.warn('Ошибка удаления:', error);
      }
    }
    
    // Закрываем меню подтверждения
    setShowDeleteConfirm(false);
    setDeleteAction(null);
  }, [selectedMessages, deleteAction, closeReactionBar]);

  const executeDelete = useCallback(async (action: 'forMe' | 'forAll') => {
    const messageIds = Array.from(selectedMessages);
    if (__DEV__) console.log('executeDelete:', { messageIds, action, selectedMessages: selectedMessages.size });
    
    if (messageIds.length > 0) {
      try {
        const { deleteForMe, deleteForAll } = useMessageStore.getState();
        if (__DEV__) console.log('Store methods:', { deleteForMe: !!deleteForMe, deleteForAll: !!deleteForAll });
        
        if (action === 'forMe') {
          if (__DEV__) console.log('Вызываем deleteForMe');
          deleteForMe(messageIds, 'me');
          
          // Сохраняем для отмены
          setLastDeletedMessages(messageIds);
          setLastDeleteAction(action);
          setShowUndo(true);
          
          // Автоматически скрываем через 3 секунды
          setTimeout(() => {
            setShowUndo(false);
            setLastDeletedMessages([]);
            setLastDeleteAction(null);
          }, 3000);
        } else if (action === 'forAll') {
          if (__DEV__) console.log('Вызываем deleteForAll');
          await deleteForAll(messageIds, 'me');
        }
        
        // Очищаем выбор после удаления
        const clearSelection = useMessageStore.getState().clearSelection;
        clearSelection();
        setSelectedMessages(new Set());
        setSelectedMessagesCount(0);
        
        // Закрываем ReactionBar
        closeReactionBar();
        
        if (__DEV__) console.log('Удаление завершено');
      } catch (error) {
        if (__DEV__) console.warn('Ошибка удаления:', error);
      }
    }
    
    // Закрываем меню подтверждения
    setShowDeleteConfirm(false);
    setDeleteAction(null);
  }, [selectedMessages, closeReactionBar]);

  const undoDelete = useCallback(() => {
    if (lastDeletedMessages.length > 0 && lastDeleteAction === 'forMe') {
      try {
        // Восстанавливаем сообщения (убираем из deletedFor)
        const { updateMessage } = useMessageStore.getState();
        
        lastDeletedMessages.forEach(messageId => {
          const message = getMessageById(messageId);
          if (message && message.deletedFor) {
            const updatedDeletedFor = message.deletedFor.filter(id => id !== 'me');
            updateMessage(messageId, { 
              deletedFor: updatedDeletedFor.length > 0 ? updatedDeletedFor : undefined 
            });
          }
        });
      } catch (error) {
        if (__DEV__) console.warn('Ошибка отмены удаления:', error);
      }
    }
    
    // Скрываем undo
    setShowUndo(false);
    setLastDeletedMessages([]);
    setLastDeleteAction(null);
  }, [lastDeletedMessages, lastDeleteAction, getMessageById]);

  // Функция отправки сообщения
  const handleSendMessage = useCallback(() => {
    if (inputText.trim() === "") return;
    
    safeExecute(() => {
      const trimmedText = inputText.trim();
      if (trimmedText.length === 0) return;
      
      addMessage(trimmedText);
      
      setInputText('');
      
      // Вызываем callback если передан
      if (onSendMessage) {
        onSendMessage(trimmedText);
      }
      
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
      <View style={[styles.flex, showDeleteConfirm && { pointerEvents: 'none' }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: currentThemeData.headerBg, pointerEvents: 'auto' }]}>
          {!isSearching ? (
            <>
              {selectedMessagesCount > 0 ? (
                // Верхняя панель действий в режиме выбора
                <>
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
                        closeReactionBar(); // Закрываем ReactionBar
                        setShowDeleteConfirm(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // Обычный заголовок
                <>
                  <Text style={styles.headerText}>Axora</Text>
                  {selectedMessageId ? (
                    <View style={styles.headerActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleReply}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="arrow-undo" size={18} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={handleCopy}
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
                        onPress={handleDelete}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.menuButton}
                      onPress={() => setShowMenu(!showMenu)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </>
          ) : (
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
                onPress={() => {
                  setIsSearching(false);
                  setSearchQuery("");
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>

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

                 {/* Список сообщений - критически важный компонент */}
         <ChatListWithReactions
          messages={filteredMessages}
          onScrollBeginDrag={() => {
            // Обработка начала скролла
          }}
          onMessageSelected={setSelectedMessageId}
          onSelectionChange={setSelectedMessagesCount}
          onSelectedMessagesChange={setSelectedMessages}
          onCloseReactionBar={closeReactionBar}
          forceCloseReactionBar={forceCloseReactionBar}
        />

        {/* Строка ввода - критически важный компонент */}
        <Animated.View style={[
          styles.inputContainer, 
          { 
            marginBottom: keyboardHeight, // Используем keyboardHeight напрямую как было
            backgroundColor: currentThemeData.inputBg,
            borderTopColor: currentThemeData.border
          }
        ]}>
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput,
              { 
                backgroundColor: currentThemeData.inputBg,
                color: currentThemeData.text,
                borderColor: currentThemeData.border
              }
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Введите сообщение..."
            placeholderTextColor="#aaa"
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            multiline={true}
            blurOnSubmit={false}
            keyboardType="default"
            autoCorrect={true}
            autoCapitalize="sentences"
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            textAlignVertical="top" // Выравнивание текста сверху
          />
          <TouchableOpacity
            style={[
              styles.sendButton, 
              { backgroundColor: currentThemeData.accent },
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
            activeOpacity={0.7}
          >
            <Ionicons name="send-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Реакции теперь обрабатываются в ChatListWithReactions */}
      </View>
      
      {/* DevHUD - отключен, только мешает */}
      {/* <DevHUD status={watchDogResult.status} /> */}
      
      {/* Меню подтверждения удаления */}
      {showDeleteConfirm && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Удалить сообщение(я)?</Text>
            <Text style={styles.confirmSubtitle}>
              Выберите тип удаления
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={styles.confirmButtonCancel}
                onPress={() => {
                  setShowDeleteConfirm(false);
                  setDeleteAction(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButtonMe}
                onPress={() => executeDelete('forMe')}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>У меня</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButtonAll, !canDeleteForAll && styles.confirmButtonDisabled]}
                onPress={() => executeDelete('forAll')}
                activeOpacity={0.7}
                disabled={!canDeleteForAll}
              >
                <Text style={[styles.confirmButtonText, !canDeleteForAll && styles.confirmButtonTextDisabled]}>
                  У всех
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {/* Уведомление об отмене удаления */}
      {showUndo && (
        <View style={styles.undoContainer}>
          <Text style={styles.undoText}>Сообщение скрыто</Text>
          <TouchableOpacity 
            style={styles.undoButton}
            onPress={undoDelete}
            activeOpacity={0.7}
          >
            <Text style={styles.undoButtonText}>Отменить</Text>
          </TouchableOpacity>
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
  actionButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.05)",
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
  // Стили для меню подтверждения
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
  },
  confirmModal: {
    backgroundColor: "#23234d",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 320,
    width: '100%',
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  confirmButtonCancel: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonMe: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonAll: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  confirmButtonTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  undoContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 4000,
  },
  undoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  undoButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  undoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});