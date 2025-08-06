import React, { useCallback } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { ChatCore } from '../components/ChatCore';
import { UIErrorBoundary } from '../components/UIErrorBoundary';
import { ChatLogicProvider, useChatLogic } from '../context/ChatLogicProvider';
import { useBotProvider } from '../hooks/useBotProvider';

interface ChatScreenProps {
  // Добавьте пропсы здесь
}


// Компонент для отображения дополнительных функций (может крашиться)
const ChatFeatures: React.FC = () => {
  const { state, addMessage, addReaction, deleteMessage } = useChatLogic();
  const { isBotEnabled, toggleBot } = useBotProvider();

  const handleSendMessage = useCallback((text: string) => {
    try {
      addMessage(text);
    } catch (error) {
      console.error('ChatFeatures: Error sending message', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  }, [addMessage]);

  const handleError = useCallback((error: Error) => {
    console.error('ChatFeatures: Error caught', error);
    // Ошибки в логике не ломают UI
  }, []);

  return (
    <ChatCore 
      onSendMessage={handleSendMessage}
      onError={handleError}
      isBotEnabled={isBotEnabled}
      onToggleBot={toggleBot}
    />
  );
};

// Главный компонент с защитной архитектурой
export const ChatScreen: React.FC = () => {
  const handleLogicError = useCallback((error: Error) => {
    console.error('ChatScreen: Logic error caught', error);
    // Логируем ошибки логики, но UI продолжает работать
  }, []);

  const handleUIError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('ChatScreen: UI error caught', error, errorInfo);
    // Критические ошибки UI логируются
  }, []);

  return (
    <UIErrorBoundary onError={handleUIError}>
      <ChatLogicProvider onError={handleLogicError}>
        <ChatFeatures />
      </ChatLogicProvider>
    </UIErrorBoundary>
  );
};

// Стили для fallback компонентов
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181825',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
}); 