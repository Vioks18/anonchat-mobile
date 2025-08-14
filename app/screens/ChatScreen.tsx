import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { View } from 'react-native';
import ChatCoreWithReactions from '../components/ChatCoreWithReactions';
import { ConfigBanner } from '../components/system/ConfigBanner';
import { useAuth } from '../hooks/useAuth';
import { useBotProvider } from '../hooks/useBotProvider';
import { useMessageStore } from '../hooks/useMessageStore';
import { deleteForAll, deleteForMe, listenMessages, markChatRead, sendMessage } from '../services/chatApi';
import { Message } from '../types/chat';

interface ChatScreenProps {
  route: {
    params: {
      chatId: string;
      title: string;
    };
  };
  navigation: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { chatId, title } = route.params;
  const { user } = useAuth();
  
  // Состояния для ботов (отключены для продакшена)
  const { isBotEnabled, toggleBot } = useBotProvider();
  // const { handleCommand, setFlatListRef } = useDevBotCommands(); // Отключено
  
  // Zustand store
  const addMessage = useMessageStore((s) => s?.addMessage || (() => {}));
  const messages = useMessageStore((s) => s?.messages || []);
  
  // Состояние для отписки от слушателей
  const [unsubscribeMessages, setUnsubscribeMessages] = useState<(() => void) | null>(null);

  // Обработка отправки сообщения
  const handleSendMessage = async (text: string) => {
    if (!user?.uid) return;

    // DevBot команды отключены для продакшена
    // if (text.startsWith('/')) {
    //   const isCommand = handleCommand(text);
    //   if (isCommand) {
    //     return; // Команда обработана, не отправляем в чат
    //   }
    // }
    
    try {
      if (chatId === 'ai-assistant') {
        // Для AI Assistant используем локальные сообщения
        addMessage(text);
      } else {
        // Отправляем сообщение в Firebase для реальных чатов
        await sendMessage(chatId, text, user.uid);
      }
    } catch (error) {
      if (__DEV__) console.error('Error sending message:', error);
    }
  };

  // Подключение к сообщениям при фокусе экрана
  useFocusEffect(
    React.useCallback(() => {
      if (!user?.uid) return;

      // Отмечаем чат как прочитанный (только для реальных чатов, не для AI Assistant)
      if (chatId !== 'ai-assistant') {
        markChatRead(chatId, user.uid).catch(error => {
          if (__DEV__) console.error('Error marking chat as read:', error);
        });
      }

      // Подписываемся на сообщения (только для реальных чатов)
      if (chatId === 'ai-assistant') {
        // Для AI Assistant используем локальные сообщения
        return;
      }
      
      const unsubscribe = listenMessages(chatId, user.uid, (firebaseMessages: Message[]) => {
        // Конвертируем сообщения в формат, совместимый с существующим UI
        const convertedMessages = firebaseMessages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.senderId === user.uid ? "me" as const : "other" as const,
          timestamp: msg.createdAt,
          status: 'sent' as const,
          reactions: msg.reactions ? Object.keys(msg.reactions) : undefined
        }));
        
        // Обновляем сообщения в store напрямую
        useMessageStore.getState().setMessages(convertedMessages);
      });

      setUnsubscribeMessages(() => unsubscribe);

      return () => {
        unsubscribe();
        setUnsubscribeMessages(null);
      };
    }, [chatId, user?.uid])
  );

  // Обработка удаления сообщений
  const handleDeleteForMe = async (messageId: string) => {
    if (!user?.uid) return;
    
    try {
      await deleteForMe(chatId, messageId, user.uid);
    } catch (error) {
      if (__DEV__) console.error('Error deleting message for me:', error);
    }
  };

  const handleDeleteForAll = async (messageId: string) => {
    if (!user?.uid) return;
    
    try {
      await deleteForAll(chatId, messageId, user.uid);
    } catch (error) {
      if (__DEV__) console.error('Error deleting message for all:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ChatCoreWithReactions 
        isBotEnabled={isBotEnabled}
        onToggleBot={toggleBot}
        onSendMessage={handleSendMessage}
        chatId={chatId}
      />
      <ConfigBanner />
    </View>
  );
};

// Экспортируем как default для Expo Router
export default ChatScreen;

// Также экспортируем как named export для обратной совместимости
export const ChatScreenInner = ChatScreen;