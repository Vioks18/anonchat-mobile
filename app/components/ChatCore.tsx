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

import React, { useRef, useState } from 'react';
import {
  FlatList,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMessageStore } from '../hooks/useMessageStore';

import { useErrorMonitor } from '../utils/errorBoundary';
import ChatListWithReactions from './ChatListWithReactions';

// Extracted components
import useKeyboardGlue from '../hooks/chat/useKeyboardGlue';
import { useChatEffects } from '../hooks/useChatEffects';
import { useChatHandlerWrappers } from '../hooks/useChatHandlerWrappers';
import { useChatLogic } from '../hooks/useChatLogic';
import { useChatUIState } from '../hooks/useChatUIState';
import { useMessageSender } from '../hooks/useMessageSender';
import { useSafeExecute } from '../hooks/useSafeExecute';
import { ChatCoreFallback, ChatMenus, HeaderBar, InputBar, SelectionToolbar } from './chat';
import { styles } from './chat/ChatCore.styles';
import ReplyPreview from './ReplyPreview';

interface ChatCoreProps {
  // Минимальные пропсы для изоляции
  onSendMessage?: (text: string) => void;
  onError?: (error: Error) => void;
  isBotEnabled?: boolean;
  onToggleBot?: () => void;
}





const ChatCoreInner: React.FC<ChatCoreProps> = ({ onSendMessage, onError, isBotEnabled = false, onToggleBot }) => {
  // Используем систему мониторинга ошибок
  const { addError, getStats, isStable } = useErrorMonitor();
  
  // Состояние для отслеживания критических ошибок
  const [hasCriticalError, setHasCriticalError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Подключаем Zustand store для сообщений с защитой
  const messages = useMessageStore((s) => s?.messages || []);
  const addMessage = useMessageStore((s) => s?.addMessage || (() => {}));
  const removeMessage = useMessageStore((s) => s?.removeMessage || (() => {}));
  const setReplyDraft = useMessageStore((s) => s?.setReplyDraft || (() => {}));
  const replyDraft = useMessageStore((s) => s?.replyDraft || null);
  const getMessageById = useMessageStore((s) => s?.getMessageById || (() => undefined));
  const clearSelection = useMessageStore((s) => s?.clearSelection || (() => {}));
  
  // Получаем выбранное сообщение для действий
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessagesCount, setSelectedMessagesCount] = useState(0);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  
  // Состояние для input
  const [inputText, setInputText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  
  // Используем извлеченные эффекты чата
  const { textInputRef } = useChatEffects(
    inputText,
    setSelectedMessages,
    setSelectedMessagesCount
  );

  // Используем извлеченные обертки обработчиков
  const {
    handleReply,
    handleCopy,
    handleForward,
    handleDelete,
    handleCopySelected,
    handleDeleteSelected,
  } = useChatHandlerWrappers(
    selectedMessageId,
    setSelectedMessageId,
    selectedMessages
  );
  
  // Используем извлеченные состояния UI
  const {
    currentTheme,
    setCurrentTheme,
    showThemeSelector,
    setShowThemeSelector,
    showMenu,
    setShowMenu,
    isSearching,
    setIsSearching,
    searchQuery,
    setSearchQuery,
  } = useChatUIState();
  
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

  // Используем извлеченную логику фильтрации и тем
  const { currentThemeData, filteredMessages } = useChatLogic(
    messages,
    searchQuery,
    currentTheme,
    addError
  );

  // Используем извлеченную утилиту безопасного выполнения
  const { safeExecute } = useSafeExecute(
    addError,
    onError,
    setHasCriticalError,
    setErrorMessage
  );



  // Используем извлеченную логику отправки сообщений
  const { handleSendMessage } = useMessageSender(
    inputText,
    setInputText,
    addMessage,
    onSendMessage,
    safeExecute,
    setReplyDraft
  );

  // Критическая ошибка - показываем fallback
  if (hasCriticalError) {
    return <ChatCoreFallback error={errorMessage} />;
  }

  // Fallback UI при ошибках
  if (!messages) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.flex}>
          <Text style={styles.errorText}>Загрузка сообщений...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentThemeData.bg }]} edges={["top", "bottom"]}>
      <View style={styles.flex}>
        {/* Header */}
        {selectedMessagesCount > 0 ? (
          <SelectionToolbar
            selectedMessagesCount={selectedMessagesCount}
            setSelectedMessageId={setSelectedMessageId}
            setSelectedMessagesCount={setSelectedMessagesCount}
            setSelectedMessages={setSelectedMessages}
            handleReply={handleReply}
            handleCopySelected={handleCopySelected}
            handleForward={handleForward}
            handleDeleteSelected={handleDeleteSelected}
            currentThemeData={currentThemeData}
          />
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

        {/* Превью ответа */}
        <ReplyPreview
          replyTo={replyDraft}
          setReplyTo={setReplyDraft}
          styles={styles}
          themedStyles={currentThemeData}
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
    </SafeAreaView>
  );
};

// Экспортируем как default для Expo Router
export default ChatCoreInner;

// Также экспортируем как named export для обратной совместимости
export const ChatCore = ChatCoreInner; 