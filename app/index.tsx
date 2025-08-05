import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MessageItem from "./components/MessageItem";
import ReplyPreview from "./components/ReplyPreview";
import VoiceRecorder from "./components/VoiceRecorder";

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

const ACCENT = "#6c5ce7";
const BG_DARK = "#181825";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
  reactions: string[];
  replyTo?: Message;
  audio?: string;
  duration?: number;
  image?: string;
}

export default function Index() {
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
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
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string>('');
  const [imageText, setImageText] = useState('');
  const [showImageTextModal, setShowImageTextModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Анимации (оптимизированные)
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const inputAnimation = useRef(new Animated.Value(0)).current;
  const selectionAnimation = useRef(new Animated.Value(0)).current;
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const searchAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      // Упрощенная анимация для экономии ресурсов
      Animated.timing(inputAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      Animated.timing(inputAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

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

  // Профессиональный haptic feedback
  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light') => {
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
      }
    } catch (error) {
      // Игнорируем ошибки haptic feedback
    }
  };

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
  }, [selectedMessages, showDeleteOptions]);

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
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      try {
        await triggerHaptic('success');
      } catch (error) {
        // Игнорируем ошибки
      }
      console.log("Скопировано:", message.text);
      // TODO: Добавить копирование после eject
    }
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
  };

  const replyToMessage = async (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      try {
        await triggerHaptic('light');
      } catch (error) {
        // Игнорируем ошибки
      }
      setReplyTo(message);
      setInput("");
    }
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
  };

  const sendMessage = async () => {
    if (input.trim() === "" || isSending) return;
    
    try {
      await triggerHaptic('light');
    } catch (error) {
      // Игнорируем ошибки
    }
    setIsSending(true);
    const newMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "me" as const,
      timestamp: Date.now(),
      status: "sending" as const,
      reactions: [],
      replyTo: replyTo || undefined,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setReplyTo(null);
    
    // Имитация отправки на сервер
    setTimeout(() => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: "sent" as const }
            : msg
        )
      );
    }, 1000);
    
    // Имитация доставки
    setTimeout(() => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: "delivered" as const }
            : msg
        )
      );
    }, 2000);
    
    // Имитация прочтения
    setTimeout(() => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: "read" as const }
            : msg
        )
      );
    }, 3000);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
      setIsSending(false);
    }, 500);
  };

  const sendVoiceMessage = useCallback(async (audioUri: string, duration: number) => {
    console.log('Отправляем голосовое сообщение:', audioUri, duration);

    const newMessage = {
      id: Date.now().toString(),
      text: "",
      sender: "me" as const,
      timestamp: Date.now(),
      status: "sending" as const,
      reactions: [],
      audio: audioUri,
      duration: duration,
    };

    console.log('Созданное голосовое сообщение:', newMessage);
    
    setMessages((prev) => [...prev, newMessage]);
    setShowVoiceRecorder(false);
    
    // Имитация отправки
    setTimeout(() => {
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: "sent" as const }
            : msg
        )
      );
    }, 1000);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        setShowImageTextModal(true);
        setShowMediaMenu(false);
      }
    } catch (error) {
      console.error('Ошибка при выборе изображения:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать изображение');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        setShowImageTextModal(true);
        setShowMediaMenu(false);
      }
    } catch (error) {
      console.error('Ошибка при съемке фото:', error);
      Alert.alert('Ошибка', 'Не удалось сделать фото');
    }
  };

  const sendImageWithText = async () => {
    if (!selectedImageUri) return;

    setIsProcessingImage(true);
    
    try {
      // Имитация обработки изображения
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage = {
        id: Date.now().toString(),
        text: imageText,
        sender: "me" as const,
        timestamp: Date.now(),
        status: "sending" as const,
        reactions: [],
        image: selectedImageUri,
      };

      setMessages((prev) => [...prev, newMessage]);
      setSelectedImageUri('');
      setImageText('');
      setShowImageTextModal(false);
      
      // Имитация отправки
      setTimeout(() => {
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, status: "sent" as const }
              : msg
          )
        );
      }, 1000);
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Ошибка при отправке изображения:', error);
      Alert.alert('Ошибка', 'Не удалось отправить изображение');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Фильтрация сообщений по поиску (оптимизированная)
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const query = searchQuery.toLowerCase();
    return messages.filter(msg => 
      msg.text.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  // Получаем текущую тему
  const currentThemeData = THEMES[currentTheme as keyof typeof THEMES];

  // Создаем стили с учетом темы
  const themedStyles = useMemo(() => ({
    ...styles,
    safe: { ...styles.safe, backgroundColor: currentThemeData.bg },
    header: { ...styles.header, backgroundColor: currentThemeData.headerBg },
    headerText: { ...styles.headerText, color: currentThemeData.text },
    inputContainer: { 
      ...styles.inputContainer, 
      backgroundColor: currentThemeData.headerBg,
      borderTopColor: currentThemeData.border 
    },
    input: { 
      ...styles.input, 
      backgroundColor: currentThemeData.inputBg,
      color: currentThemeData.text,
      borderColor: currentThemeData.border 
    },
    sendButton: { ...styles.sendButton, backgroundColor: currentThemeData.accent },
    attachButton: { ...styles.attachButton, backgroundColor: currentThemeData.accent },
    voiceButton: { ...styles.voiceButton, backgroundColor: currentThemeData.accent },
    bubbleMe: { ...styles.bubbleMe, backgroundColor: currentThemeData.bubbleMe },
    bubbleOther: { ...styles.bubbleOther, backgroundColor: currentThemeData.bubbleOther },
    bubbleText: { ...styles.bubbleText, color: currentThemeData.text },
    timestamp: { ...styles.timestamp, color: currentThemeData.text },
    statusDelivered: { ...styles.statusDelivered, color: currentThemeData.accent },
    statusRead: { ...styles.statusRead, color: currentThemeData.accent },
  }), [currentTheme]);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageItem
      item={item}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onRemoveReaction={removeReaction}
      onAddReaction={addReaction}
      showReactions={showReactions}
      isSelected={selectedMessages.has(item.id)}
      styles={themedStyles}
    />
  ), [handlePress, handleLongPress, removeReaction, addReaction, showReactions, selectedMessages, themedStyles]);

  return (
    <SafeAreaView style={themedStyles.safe} edges={["top", "bottom"]}>
      <View style={styles.flex}>
        {/* Header */}
        <Animated.View 
          style={[
            themedStyles.header,
            {
              transform: [{
                translateY: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                })
              }],
              opacity: headerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.8],
              })
            }
          ]}
        >
          {!isSearching ? (
            <>
          <Text style={themedStyles.headerText}>Axora</Text>
              {selectedMessages.size === 0 && (
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => setShowMenu(!showMenu)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Animated.View 
              style={[
                styles.searchContainer,
                {
                  transform: [{
                    scaleX: searchAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }],
                  opacity: searchAnimation
                }
              ]}
            >
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
                  Animated.spring(searchAnimation, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                  }).start();
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}
          {selectedMessages.size > 0 && (
            <Animated.View 
              style={[
                styles.headerButtons,
                {
                  transform: [{
                    scale: selectionAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    })
                  }],
                  opacity: selectionAnimation
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => {
                  const messageId = Array.from(selectedMessages)[0];
                  if (messageId) copyMessage(messageId);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="copy-outline" size={20} color="#fff" />
              </TouchableOpacity>
              {selectedMessages.size === 1 && (
                <TouchableOpacity 
                  style={styles.headerButton} 
                  onPress={() => {
                    const messageId = Array.from(selectedMessages)[0];
                    if (messageId) replyToMessage(messageId);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.headerButton} 
                onPress={() => setShowDeleteOptions(!showDeleteOptions)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
        
        {/* Menu Modal */}
        {showMenu && (
          <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
            <View style={styles.menuOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.menuContent}>
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowMenu(false);
                      setIsSearching(true);
                      Animated.spring(searchAnimation, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 8,
                      }).start();
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
        </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Delete Options Modal */}
        {showDeleteOptions && selectedMessages.size > 0 && (
          <TouchableWithoutFeedback onPress={() => setShowDeleteOptions(false)}>
            <Animated.View 
              style={[
                styles.deleteModal,
                {
                  opacity: modalAnimation
                }
              ]}
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <Animated.View 
                  style={[
                    styles.deleteModalContent,
                    {
                      transform: [{
                        translateY: modalAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [200, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <Text style={styles.deleteModalTitle}>Удалить сообщение?</Text>
                  <TouchableOpacity 
                    style={styles.deleteOption}
                    onPress={() => {
                      const messageId = Array.from(selectedMessages)[0];
                      if (messageId) deleteForMe(messageId);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteOptionText}>Удалить у себя</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteOption}
                    onPress={() => {
                      const messageId = Array.from(selectedMessages)[0];
                      if (messageId) deleteForEveryone(messageId);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteOptionText}>Удалить у всех</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteCancel}
                    onPress={() => setShowDeleteOptions(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteCancelText}>Отмена</Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
                )}

        {/* Theme Selector Modal */}
        {showThemeSelector && (
          <TouchableWithoutFeedback onPress={() => setShowThemeSelector(false)}>
            <View style={styles.themeModal}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.themeModalContent}>
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
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Messages */}
        <TouchableWithoutFeedback onPress={handleScreenPress}>
        <FlatList
          ref={flatListRef}
            data={filteredMessages}
          renderItem={renderItem}
          keyExtractor={useCallback((item: Message) => item.id, [])}
            getItemLayout={useCallback((data: any, index: number) => ({
              length: 80,
              offset: 80 * index,
              index,
            }), [])}
          contentContainerStyle={styles.messagesContainer}
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
            maxToRenderPerBatch={5}
            windowSize={5}
            initialNumToRender={5}
            showsVerticalScrollIndicator={false}
          />
        </TouchableWithoutFeedback>
        
        {/* Reply Preview */}
        {replyTo && (
          <ReplyPreview
            replyTo={replyTo}
            onClose={() => setReplyTo(null)}
            styles={themedStyles}
          />
        )}
        
        {/* Input */}
        <Animated.View 
          style={[
            themedStyles.inputContainer,
            { 
              marginBottom: keyboardHeight,
              transform: [{
                translateY: inputAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5],
                })
              }]
            }
          ]}
        > 
          {showVoiceRecorder ? (
            <VoiceRecorder 
              onSend={sendVoiceMessage} 
              onClose={() => setShowVoiceRecorder(false)}
            />
          ) : (
            <>
              <TextInput
                style={themedStyles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Введите сообщение..."
                placeholderTextColor="#aaa"
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                multiline={true}
                maxLength={1000}
              />
              
              {input.trim() === "" ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.attachButton,
                      themedStyles.sendButton,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setShowMediaMenu(true)}
                  >
                    <Ionicons 
                      name="add" 
                      size={20} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.voiceButton,
                      themedStyles.sendButton,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setShowVoiceRecorder(true)}
                  >
                    <Ionicons 
                      name="mic" 
                      size={20} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    themedStyles.sendButton, 
                    isSending && styles.sendButtonDisabled,
                  ]}
                  activeOpacity={0.7}
                  onPress={sendMessage}
                  disabled={isSending}
                >
                  <Ionicons name="send-outline" size={22} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          )}
        </Animated.View>
      </View>

      {/* Media Menu Modal */}
      {showMediaMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMediaMenu(false)}>
          <View style={styles.mediaMenuOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.mediaMenuContent}>
                <TouchableOpacity 
                  style={styles.mediaMenuItem}
                  onPress={takePhoto}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.mediaMenuItemText}>Камера</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.mediaMenuItem}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <Ionicons name="images" size={24} color="#fff" />
                  <Text style={styles.mediaMenuItemText}>Галерея</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Image Text Modal */}
      {showImageTextModal && selectedImageUri && (
        <Modal
          visible={showImageTextModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.imageModalOverlay}>
            <View style={styles.imageModalContent}>
              <Image 
                source={{ uri: selectedImageUri }}
                style={styles.imageModalImage}
                resizeMode="contain"
              />
              <TextInput
                style={styles.imageModalInput}
                value={imageText}
                onChangeText={setImageText}
                placeholder="Добавить текст к изображению..."
                placeholderTextColor="#aaa"
                multiline
                maxLength={500}
              />
              <View style={styles.imageModalButtons}>
                <TouchableOpacity
                  style={styles.imageModalCancelButton}
                  onPress={() => {
                    setShowImageTextModal(false);
                    setSelectedImageUri('');
                    setImageText('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.imageModalCancelText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.imageModalSendButton,
                    isProcessingImage && styles.imageModalSendButtonDisabled
                  ]}
                  onPress={sendImageWithText}
                  disabled={isProcessingImage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.imageModalSendText}>
                    {isProcessingImage ? 'Отправка...' : 'Отправить'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG_DARK,
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
    shadowColor: ACCENT,
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
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 8,
    justifyContent: "flex-end",
  },
  messageContainer: {
    marginBottom: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  messageContainerWithImage: {
    marginBottom: 2,
    paddingVertical: 4,
    paddingHorizontal: 0,
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
  bubbleContainerWithImage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: "flex-end",
    maxWidth: "85%",
    marginRight: 0,
    alignSelf: 'flex-end',
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
    overflow: 'hidden',
  },
  bubbleMe: {
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleOther: {
    backgroundColor: "#23234d",
    alignSelf: "flex-start",
    shadowColor: "#23234d",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 0,
  },

  bubbleSelected: {
    borderWidth: 3,
    borderColor: "#6c5ce7",
    shadowColor: "#6c5ce7",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  bubbleSelectedOther: {
    borderWidth: 3,
    borderColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },


  bubbleText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-Regular",
    marginRight: 8,
    maxWidth: '85%',
  },





  timestamp: {
    fontSize: 10,
    color: "#fff",
    opacity: 0.7,
    fontFamily: "Poppins-Regular",
    marginLeft: 'auto',
  },

  statusIcon: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.7,
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#282850",
    backgroundColor: "rgba(34,30,60,0.98)",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: ACCENT,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    zIndex: 1000,
    minHeight: 60,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#23234d",
    borderRadius: 16,
    marginRight: 8,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#444",
    fontFamily: "Poppins-Regular",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonInactive: {
    opacity: 0.5,
    backgroundColor: "#444",
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  voiceButtonRecording: {
    backgroundColor: "rgba(255,68,68,0.2)",
    borderWidth: 2,
    borderColor: "#ff4444",
  },
  cancelButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,68,68,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageContentWithImage: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
  },

  statusSending: {
    color: "#888",
  },
  statusSent: {
    color: "#888",
  },
  statusDelivered: {
    color: "#2196F3",
  },
  statusRead: {
    color: "#4CAF50", // Green for read
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  reaction: {
    marginRight: 8,
  },
  reactionText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-Regular",
  },
  reactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
    marginBottom: 4,
  },
  reactionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  reactionButtonText: {
    fontSize: 18,
    color: "#fff",
  },
  reactionsPopup: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: "#23234d",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  reactionsPopupRight: {
    right: 10,
  },
  contextMenu: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    backgroundColor: "#23234d",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: 200,
  },
  contextMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 5,
  },
  contextMenuText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Poppins-Regular",
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
    marginLeft: 8,
  },
  replyContainer: {
    backgroundColor: "#23234d",
    borderTopWidth: 1,
    borderTopColor: "#444",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  replyContent: {
    flex: 1,
    marginRight: 10,
  },
  replyLabel: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Poppins-Regular",
  },
  replyText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Poppins-Regular",
  },
  replyClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  replyCloseText: {
    fontSize: 12,
    color: "#fff",
  },
  replyPreview: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 6,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
  },
  replyPreviewText: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    fontFamily: "Poppins-Regular",
  },
  messageOverlay: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
    zIndex: -1,
  },
  deleteModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  deleteModalContent: {
    backgroundColor: "#23234d",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 12,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  deleteOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  deleteOptionText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Poppins-Regular",
  },
  deleteCancel: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    marginTop: 6,
  },
  deleteCancelText: {
    fontSize: 14,
    color: "#888",
    fontFamily: "Poppins-Regular",
  },
  searchButton: {
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
    marginRight: 16,
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 0,
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  searchCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  menuItemText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 12,
    fontFamily: "Poppins-Regular",
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
    zIndex: 1000,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
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
  themeTransitionOverlay: {
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
  themeTransitionSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageImage: {
    width: 250,
    height: 250,
    borderRadius: 8,
    marginBottom: 0,
    alignSelf: 'flex-start',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesCount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  imageTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
    width: 250,
    paddingHorizontal: 4,
  },
  bubbleTextWithImage: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    flex: 1,
    marginRight: 8,
    maxWidth: 230,
    lineHeight: 22,
  },

  timestampWithImage: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontFamily: 'SpaceMono-Regular',
  },
  bubbleWithImage: {
    padding: 2,
    borderRadius: 12,
    marginRight: 0,
    marginLeft: 0,
    marginTop: 0,
    marginBottom: 0,
    overflow: 'hidden',
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 0.5,
  },
  textBubbleContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
    maxWidth: "85%",
  },
  textBubble: {
    backgroundColor: ACCENT,
    padding: 12,
    borderRadius: 14,
    shadowColor: ACCENT,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: "100%",
  },
  mediaMenuOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  mediaMenuContent: {
    backgroundColor: '#23234d',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  mediaMenuTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  mediaMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  mediaMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
  },
  mediaMenuItemText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
    fontFamily: 'Poppins-Regular',
  },
  audioContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    minHeight: 40,
  },
  audioButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioInfo: {
    marginLeft: 8,
    flex: 1,
  },
  audioText: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  audioDuration: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'SpaceMono-Regular',
  },
  recordingTime: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'SpaceMono-Regular',
    marginLeft: 4,
  },

  cancelRecordingButton: {
    backgroundColor: 'rgba(255,68,68,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelRecordingText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  audioProgressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  audioProgressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  audioProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
    width: '30%', // Примерная ширина прогресса
  },
  recordingInputContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  recordingInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  recordingInputText: {
    fontSize: 16,
    color: '#ff4444',
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
    flex: 1,
  },
  lockButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  lockButtonActive: {
    backgroundColor: "#ff4444",
  },
  lockAnimationContainer: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  lockAnimationContent: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  lockAnimationText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    marginTop: 8,
  },
  lockIconContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  lockIconContent: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  lockIconText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23234d',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
  inputWithButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23234d',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
  inputInsideContainer: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "transparent",
    color: "#fff",
    borderWidth: 0,
    fontFamily: "Poppins-Regular",
  },
  voiceRecordingContainer: {
    flex: 1,
    backgroundColor: "#23234d",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#444",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  voiceRecordingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  voiceRecordingIcon: {
    marginRight: 8,
  },
  voiceRecordingText: {
    flex: 1,
    fontSize: 16,
    color: "#ff4444",
    fontFamily: "Poppins-Regular",
  },
  voiceRecordingWaveform: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 20,
    gap: 2,
  },
  voiceWaveformBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: "#ff6666",
  },
  voiceButtonContent: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceButtonPulse: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "transparent",
  },
  voiceButtonActive: {
    backgroundColor: "#ff4444",
    transform: [{ scale: 1.1 }],
  },
  imageProcessingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  imageProcessingContent: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  imageProcessingSpinner: {
    marginBottom: 12,
  },
  imageProcessingText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  imageModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  imageModalContent: {
    backgroundColor: '#23234d',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  imageModalImage: {
    width: '100%',
    height: 300,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageModalInput: {
    padding: 16,
    paddingTop: 10,
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    marginTop: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingTop: 0,
  },
  imageModalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  imageModalCancelText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  imageModalSendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: ACCENT,
  },
  imageModalSendButtonDisabled: {
    opacity: 0.7,
  },
  imageModalSendText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
});