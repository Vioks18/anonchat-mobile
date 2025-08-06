import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { ChatMessage } from '../components/ChatMessage';
import { Header } from '../components/Header';
import { MessageInput } from '../components/MessageInput';
import { ReplyPreview } from '../components/ReplyPreview';
import { ACCENT, BG_DARK, THEMES } from '../constants/themes';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import { Message } from '../types/message';
import { triggerHaptic } from '../utils/haptics';

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Привет! Как дела?",
      sender: "other",
      timestamp: Date.now() - 60000,
      status: "read",
      reactions: [],
    },
    {
      id: "2", 
      text: "Привет! Все хорошо, спасибо! Как у тебя?",
      sender: "me",
      timestamp: Date.now() - 45000,
      status: "read",
      reactions: ["👍"],
    },
    {
      id: "3",
      text: "Отлично! Работаю над новым проектом",
      sender: "other",
      timestamp: Date.now() - 30000,
      status: "read",
      reactions: [],
    },
    {
      id: "4",
      text: "Звучит интересно! Расскажи подробнее",
      sender: "me",
      timestamp: Date.now() - 15000,
      status: "read",
      reactions: [],
    },
  ]);
  const [input, setInput] = useState("");
  const keyboardHeight = useKeyboardHeight();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("dark");
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Анимации (оптимизированные)
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const selectionAnimation = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const searchAnimation = useRef(new Animated.Value(0)).current;

  // Анимация модального окна (оптимизированная)
  useEffect(() => {
    if (showDeleteOptions) {
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showDeleteOptions]);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    try {
      await triggerHaptic('light');
    } catch (error) {
      // Игнорируем ошибки
    }
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { 
              ...msg, 
              reactions: msg.reactions.includes(reaction) 
                ? msg.reactions.filter(r => r !== reaction)
                : [reaction]
            }
          : msg
      )
    );
    setShowReactions(null);
  }, []);

  const removeReaction = useCallback(async (messageId: string) => {
    try {
      await triggerHaptic('light');
    } catch (error) {
      // Игнорируем ошибки
    }
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, reactions: [] }
          : msg
      )
    );
  }, []);

  const handleLongPress = useCallback(async (messageId: string) => {
    // Если открыто модальное окно удаления, не выделяем сообщение
    if (showDeleteOptions) {
      return;
    }
    
    try {
      await triggerHaptic('medium');
    } catch (error) {
      // Игнорируем ошибки
    }
    const newSelectedMessages = new Set(selectedMessages);
    if (newSelectedMessages.has(messageId)) {
      newSelectedMessages.delete(messageId);
    } else {
      newSelectedMessages.add(messageId);
    }
    setSelectedMessages(newSelectedMessages);
    setShowReactions(null);
    
    if (newSelectedMessages.size > 0) {
      try {
        Animated.spring(selectionAnimation, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } catch (error) {
        // Игнорируем ошибки анимации
      }
    } else {
      try {
        Animated.spring(selectionAnimation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } catch (error) {
        // Игнорируем ошибки анимации
      }
    }
  }, [showDeleteOptions, selectedMessages]);

  const handlePress = useCallback(async (messageId: string) => {
    // Если открыто модальное окно удаления, не показываем реакции
    if (showDeleteOptions) {
      return;
    }
    
    // Если есть выделенные сообщения, добавляем/убираем текущее
    if (selectedMessages.size > 0) {
      const newSelectedMessages = new Set(selectedMessages);
      if (newSelectedMessages.has(messageId)) {
        newSelectedMessages.delete(messageId);
      } else {
        newSelectedMessages.add(messageId);
      }
      setSelectedMessages(newSelectedMessages);
      setShowReactions(null);
      return;
    }
    
    try {
      await triggerHaptic('light');
    } catch (error) {
      // Игнорируем ошибки
    }
    setShowReactions(showReactions === messageId ? null : messageId);
    setSelectedMessages(new Set());
    try {
      Animated.spring(selectionAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } catch (error) {
      // Игнорируем ошибки анимации
    }
  }, [showReactions, showDeleteOptions, selectedMessages]);

  const handleScreenPress = useCallback(async () => {
    if (selectedMessages.size > 0 || showReactions || showDeleteOptions) {
      try {
        await triggerHaptic('light');
      } catch (error) {
        // Игнорируем ошибки
      }
      setSelectedMessages(new Set());
      setShowReactions(null);
      setShowDeleteOptions(false);
      try {
        Animated.spring(selectionAnimation, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } catch (error) {
        // Игнорируем ошибки анимации
      }
    }
  }, [selectedMessages, showReactions, showDeleteOptions]);

  const deleteMessage = async (messageId: string) => {
    try {
      await triggerHaptic('warning');
    } catch (error) {
      // Игнорируем ошибки
    }
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setSelectedMessages(new Set());
    setShowDeleteOptions(false);
    try {
      Animated.spring(selectionAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } catch (error) {
      // Игнорируем ошибки анимации
    }
  };

  const deleteForMe = async (messageId: string) => {
    try {
      await triggerHaptic('warning');
    } catch (error) {
      // Игнорируем ошибки
    }
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setSelectedMessages(new Set());
    setShowDeleteOptions(false);
    try {
      Animated.spring(selectionAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } catch (error) {
      // Игнорируем ошибки анимации
    }
  };

  const deleteForEveryone = async (messageId: string) => {
    try {
      await triggerHaptic('warning');
    } catch (error) {
      // Игнорируем ошибки
    }
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setSelectedMessages(new Set());
    setShowDeleteOptions(false);
    try {
      Animated.spring(selectionAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } catch (error) {
      // Игнорируем ошибки анимации
    }
  };

  const copyMessage = async (messageId: string) => {
    try {
      await triggerHaptic('success');
    } catch (error) {
      // Игнорируем ошибки
    }
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      // Здесь можно добавить копирование в буфер обмена
      Alert.alert("Скопировано", "Сообщение скопировано в буфер обмена");
    }
    setSelectedMessages(new Set());
    setShowReactions(null);
  };

  const replyToMessage = async (messageId: string) => {
    try {
      await triggerHaptic('light');
    } catch (error) {
      // Игнорируем ошибки
    }
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setReplyTo(message);
    }
    setSelectedMessages(new Set());
    setShowReactions(null);
  };

  const sendMessage = async () => {
    if (input.trim() === "" || isSending) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "me",
      timestamp: Date.now(),
      status: "sending",
      reactions: [],
      replyTo: replyTo || undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setReplyTo(null);
    setIsSending(true);

    // Имитация отправки
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
          )
        );
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id ? { ...msg, status: "read" } : msg
            )
          );
        }, 1000);
      }, 500);
    }, 1000);

    setTimeout(() => {
      setIsSending(false);
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  // Тема
  const currentThemeData = THEMES[currentTheme as keyof typeof THEMES] || THEMES.dark;

  const themedStyles = useMemo(() => ({
    safe: { ...styles.safe, backgroundColor: currentThemeData.bg },
    header: { ...styles.header, backgroundColor: currentThemeData.headerBg },
    headerText: { ...styles.headerText, color: currentThemeData.text },
    bubbleMe: { ...styles.bubbleMe, backgroundColor: currentThemeData.accent },
    bubbleOther: { ...styles.bubbleOther, backgroundColor: currentThemeData.bubbleOther },
    bubbleText: { ...styles.bubbleText, color: currentThemeData.text },
    timestamp: { ...styles.timestamp, color: currentThemeData.text },
    statusDelivered: { ...styles.statusDelivered, color: currentThemeData.text },
    statusRead: { ...styles.statusRead, color: currentThemeData.accent },
    inputContainer: { ...styles.inputContainer, backgroundColor: currentThemeData.inputBg, marginBottom: keyboardHeight },
    input: { ...styles.input, color: currentThemeData.text, backgroundColor: currentThemeData.inputBg },
    sendButton: { ...styles.sendButton, backgroundColor: currentThemeData.accent },
  }), [currentTheme, keyboardHeight]);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <ChatMessage
      item={item}
      handlePress={handlePress}
      handleLongPress={handleLongPress}
      removeReaction={removeReaction}
      addReaction={addReaction}
      showReactions={showReactions}
      selectedMessages={selectedMessages}
      themedStyles={themedStyles}
      styles={styles}
    />
  ), [handlePress, handleLongPress, removeReaction, addReaction, showReactions, selectedMessages, themedStyles]);

  return (
    <SafeAreaView style={themedStyles.safe}>
      <View style={styles.flex}>
        <Header
          isSearching={isSearching}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsSearching={setIsSearching}
          selectedMessages={selectedMessages}
          setShowMenu={setShowMenu}
          showMenu={showMenu}
          headerAnimation={headerAnimation}
          searchAnimation={searchAnimation}
          selectionAnimation={selectionAnimation}
          themedStyles={themedStyles}
          styles={styles}
          deleteMessage={deleteMessage}
          copyMessage={copyMessage}
          replyToMessage={replyToMessage}
          setSelectedMessages={setSelectedMessages}
          setShowReactions={setShowReactions}
          setShowDeleteOptions={setShowDeleteOptions}
        />

        <TouchableOpacity
          style={styles.messagesContainer}
          onPress={handleScreenPress}
          activeOpacity={1}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => setShowReactions(null)}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            removeClippedSubviews={true}
            getItemLayout={(data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })}
          />
        </TouchableOpacity>

        <ReplyPreview
          replyTo={replyTo}
          setReplyTo={setReplyTo}
          styles={styles}
          themedStyles={themedStyles}
        />

        <MessageInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          isSending={isSending}
          keyboardHeight={keyboardHeight}
          themedStyles={themedStyles}
          styles={styles}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 96,
    backgroundColor: "#23234d",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 0,
    shadowColor: ACCENT,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  headerText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingBottom: 100,
    paddingHorizontal: 8,
  },
  messageContainer: {
    marginBottom: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  messageTouchable: {
    flex: 1,
  },
  bubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: "flex-end",
    maxWidth: "80%",
  },
  bubbleContainerOther: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: "flex-start",
    maxWidth: "80%",
  },
  bubble: {
    maxWidth: "100%",
    padding: 8,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  bubbleMe: {
    backgroundColor: ACCENT,
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: "#2a2a4a",
    alignSelf: 'flex-start',
  },
  bubbleText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  messageContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#aaa",
    marginRight: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusSending: {
    fontSize: 12,
    color: "#aaa",
  },
  statusSent: {
    fontSize: 12,
    color: "#aaa",
  },
  statusDelivered: {
    fontSize: 12,
    color: "#aaa",
  },
  statusRead: {
    fontSize: 12,
    color: ACCENT,
  },
  reactionsContainer: {
    flexDirection: "row",
    marginTop: 4,
    flexWrap: "wrap",
  },
  reaction: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  reactionText: {
    fontSize: 12,
    color: "#fff",
  },
  reactionsPopup: {
    position: "absolute",
    bottom: 40,
    left: 0,
    backgroundColor: "#2a2a4a",
    borderRadius: 12,
    padding: 8,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  reactionsPopupRight: {
    right: 0,
    left: "auto",
  },
  reactionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 2,
  },
  reactionButtonText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#23234d",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    position: "absolute",
    bottom: 45,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    backgroundColor: "#2a2a4a",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#fff",
    maxHeight: 100,
    marginRight: 8,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonInactive: {
    opacity: 0.3,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingVertical: 8,
  },
  searchCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  bubbleSelected: {
    borderWidth: 2,
    borderColor: ACCENT,
  },
  bubbleSelectedOther: {
    borderWidth: 2,
    borderColor: "#666",
  },
  replyPreview: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  replyPreviewText: {
    fontSize: 12,
    color: "#aaa",
    fontStyle: "italic",
  },
  replyPreviewContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewLabel: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 2,
  },
  replyPreviewClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  themePreviewHeader: {
    height: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
}); 