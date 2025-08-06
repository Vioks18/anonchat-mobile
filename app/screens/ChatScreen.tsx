import React, { useState } from 'react';
import ChatCore from '../components/ChatCore';
import { useBotProvider } from '../hooks/useBotProvider';
import { useDevBotCommands } from '../hooks/useDevBotCommands';

const ChatScreenInner: React.FC = () => {
  // Состояния для ботов
  const { isBotEnabled, toggleBot } = useBotProvider();
  const { handleCommand, setFlatListRef } = useDevBotCommands();
  const [inputText, setInputText] = useState('');

  // Обработка отправки сообщения
  const handleSendMessage = (text: string) => {
    // Проверяем, не является ли это командой DevBot
    if (text.startsWith('/')) {
      const isCommand = handleCommand(text);
      if (isCommand) {
        return; // Команда обработана, не отправляем в чат
      }
    }
    
    // Обычное сообщение - ChatCore сам обработает отправку
  };

  return (
    <ChatCore 
      isBotEnabled={isBotEnabled}
      onToggleBot={toggleBot}
      onSendMessage={handleSendMessage}
    />
  );
};

// Экспортируем как default для Expo Router
export default ChatScreenInner;

// Также экспортируем как named export для обратной совместимости
export const ChatScreen = ChatScreenInner;