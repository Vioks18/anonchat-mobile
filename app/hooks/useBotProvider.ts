import { useCallback, useEffect, useRef, useState } from 'react';
import { useMessageStore } from './useMessageStore';

// Сообщения бота для тестирования
const botMessages = [
  "Привет! Я бот Axora 🤖",
  "Как дела?",
  "Ты ещё тут?",
  "Нравится чат?",
  "Скоро выйдет новая фича 😉",
  "Отличная погода сегодня!",
  "Что нового?",
  "Как прошёл день?",
  "У тебя есть планы на выходные?",
  "Можешь рассказать что-нибудь интересное?",
  "Я всегда готов помочь!",
  "Технологии развиваются так быстро...",
  "Любишь программирование?",
  "Какой твой любимый язык программирования?",
  "У тебя есть мечта?",
  "Что тебя вдохновляет?",
  "Расскажи о своих увлечениях",
  "Какой фильм посмотрел недавно?",
  "Любишь путешествовать?",
  "Что думаешь об ИИ?",
];

export const useBotProvider = () => {
  const [isBotEnabled, setIsBotEnabled] = useState(false);
  const addBotMessage = useMessageStore((s) => s.addBotMessage);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Безопасная установка состояния
  const safeSetIsBotEnabled = (value: boolean) => {
    try {
      setIsBotEnabled(value);
    } catch (error) {
      console.error('useBotProvider: Ошибка установки состояния бота', error);
    }
  };

  // Функция для отправки случайного сообщения от бота
  const sendBotMessage = () => {
    try {
      if (!botMessages || botMessages.length === 0) {
        console.warn('useBotProvider: Нет доступных сообщений бота');
        return;
      }

      const randomIndex = Math.floor(Math.random() * botMessages.length);
      const randomMessage = botMessages[randomIndex];
      
      if (!randomMessage || typeof randomMessage !== 'string') {
        console.warn('useBotProvider: Невалидное сообщение бота', randomMessage);
        return;
      }

      addBotMessage(randomMessage);
      console.warn('🤖 Bot message sent:', randomMessage);
    } catch (error) {
      console.error('❌ Error sending bot message:', error);
    }
  };

  // Устанавливаем интервал (5-10 секунд случайно) - мемоизирована
  const startInterval = useCallback(() => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        if (isBotEnabled) {
          sendBotMessage();
        }
      }, 5000 + Math.random() * 10000); // 5-15 секунд
      
      // console.log('useBotProvider: Интервал запущен');
    } catch (error) {
      console.error('useBotProvider: Ошибка запуска интервала', error);
    }
  }, [isBotEnabled, sendBotMessage]);

  // Очистка интервала - мемоизирована
  const stopInterval = useCallback(() => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        // console.log('useBotProvider: Интервал остановлен');
      }
    } catch (error) {
      console.error('useBotProvider: Ошибка остановки интервала', error);
    }
  }, []);

  // Переключатель бота - мемоизирован
  const toggleBot = useCallback(() => {
    try {
      const newState = !isBotEnabled;
      safeSetIsBotEnabled(newState);
      
      if (newState) {
        console.warn('🤖 Bot enabled');
        startInterval();
      } else {
        console.warn('🤖 Bot disabled');
        stopInterval();
      }
    } catch (error) {
      console.error('useBotProvider: Ошибка переключения бота', error);
    }
  }, [isBotEnabled, safeSetIsBotEnabled, startInterval, stopInterval]);

  // Эффект для управления ботом - исправлен
  useEffect(() => {
    try {
      if (isBotEnabled) {
        startInterval();
      } else {
        stopInterval();
      }
    } catch (error) {
      console.error('useBotProvider: Ошибка в useEffect', error);
    }

    return () => {
      try {
        stopInterval();
      } catch (error) {
        console.error('useBotProvider: Ошибка очистки useEffect', error);
      }
    };
  }, [isBotEnabled, startInterval, stopInterval]);

  return {
    isBotEnabled,
    toggleBot,
  };
}; 

// Default export для Expo Router
export default useBotProvider; 