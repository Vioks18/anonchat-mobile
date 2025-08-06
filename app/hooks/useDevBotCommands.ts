import { useCallback, useRef, useState } from 'react';
import { useMessageStore } from './useMessageStore';

// Типы команд
export interface DevBotCommand {
  command: string;
  description: string;
  handler: () => void;
}

// Системное сообщение от DevBot
export interface DevBotMessage {
  id: string;
  text: string;
  type: 'system' | 'error' | 'success' | 'info';
  timestamp: number;
}

export const useDevBotCommands = () => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [devBotMessages, setDevBotMessages] = useState<DevBotMessage[]>([]);
  const addBotMessage = useMessageStore((s) => s.addBotMessage);
  const messages = useMessageStore((s) => s.messages);
  const flatListRef = useRef<any>(null);

  // Добавить системное сообщение
  const addSystemMessage = useCallback((text: string, type: DevBotMessage['type'] = 'system') => {
    const systemMessage: DevBotMessage = {
      id: `devbot_${Date.now()}`,
      text,
      type,
      timestamp: Date.now(),
    };
    
    setDevBotMessages(prev => [...prev, systemMessage]);
    
    // Также добавляем в обычные сообщения для отображения
    addBotMessage(text);
  }, [addBotMessage]);

  // Команда /scroll
  const handleScrollCommand = useCallback(() => {
    try {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
        addSystemMessage('✅ Прокрутка к концу выполнена', 'success');
      } else {
        addSystemMessage('❌ Ошибка: FlatList не найден', 'error');
      }
    } catch (error) {
      addSystemMessage(`❌ Ошибка прокрутки: ${error}`, 'error');
    }
  }, [addSystemMessage]);

  // Команда /status
  const handleStatusCommand = useCallback(() => {
    try {
      const statusInfo = [
        `📊 Статистика системы:`,
        `• Сообщений: ${messages.length}`,
        `• Debug режим: ${isDebugMode ? 'ВКЛ' : 'ВЫКЛ'}`,
        `• DevBot сообщений: ${devBotMessages.length}`,
        `• Время: ${new Date().toLocaleTimeString()}`,
      ].join('\n');
      
      addSystemMessage(statusInfo, 'info');
    } catch (error) {
      addSystemMessage(`❌ Ошибка получения статуса: ${error}`, 'error');
    }
  }, [messages.length, isDebugMode, devBotMessages.length, addSystemMessage]);

  // Команда /debug
  const handleDebugCommand = useCallback(() => {
    try {
      const newDebugMode = !isDebugMode;
      setIsDebugMode(newDebugMode);
      addSystemMessage(
        `🔧 Debug режим ${newDebugMode ? 'ВКЛЮЧЕН' : 'ВЫКЛЮЧЕН'}`,
        newDebugMode ? 'success' : 'info'
      );
    } catch (error) {
      addSystemMessage(`❌ Ошибка переключения debug: ${error}`, 'error');
    }
  }, [isDebugMode, addSystemMessage]);

  // Команда /ping
  const handlePingCommand = useCallback(() => {
    try {
      const startTime = Date.now();
      addSystemMessage('🏓 Pong! DevBot работает', 'success');
      
      if (isDebugMode) {
        const responseTime = Date.now() - startTime;
        addSystemMessage(`⏱️ Время ответа: ${responseTime}ms`, 'info');
      }
    } catch (error) {
      addSystemMessage(`❌ Ошибка ping: ${error}`, 'error');
    }
  }, [isDebugMode, addSystemMessage]);

  // Команда /help
  const handleHelpCommand = useCallback(() => {
    try {
      const helpText = [
        '🤖 **Доступные команды DevBot:**',
        '• `/scroll` — прокрутка к концу чата',
        '• `/status` — информация о системе',
        '• `/debug` — переключение debug режима',
        '• `/ping` — проверка работоспособности',
        '• `/help` — показать эту справку',
      ].join('\n');
      
      addSystemMessage(helpText, 'info');
    } catch (error) {
      addSystemMessage(`❌ Ошибка показа справки: ${error}`, 'error');
    }
  }, [addSystemMessage]);

  // Обработка команд
  const handleCommand = useCallback((text: string): boolean => {
    if (!text.startsWith('/')) {
      return false; // Не команда
    }

    const command = text.toLowerCase().trim();
    
    try {
      switch (command) {
        case '/scroll':
          handleScrollCommand();
          break;
        case '/status':
          handleStatusCommand();
          break;
        case '/debug':
          handleDebugCommand();
          break;
        case '/ping':
          handlePingCommand();
          break;
        case '/help':
          handleHelpCommand();
          break;
        default:
          addSystemMessage(`❌ Неизвестная команда: ${text}\nИспользуйте /help для справки`, 'error');
          break;
      }
      return true; // Команда обработана
    } catch (error) {
      addSystemMessage(`❌ Ошибка выполнения команды: ${error}`, 'error');
      return true;
    }
  }, [
    handleScrollCommand,
    handleStatusCommand,
    handleDebugCommand,
    handlePingCommand,
    handleHelpCommand,
    addSystemMessage
  ]);

  // Установить ref для FlatList
  const setFlatListRef = useCallback((ref: any) => {
    flatListRef.current = ref;
  }, []);

  return {
    handleCommand,
    isDebugMode,
    devBotMessages,
    setFlatListRef,
    addSystemMessage,
  };
};

// Default export для Expo Router
export default useDevBotCommands;
