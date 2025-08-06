import React, { useEffect, useRef } from 'react';
import { useMessageStore } from '../hooks/useMessageStore';

interface FakeSocketProviderProps {
  children: React.ReactNode;
}

// Сообщения бота
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

export const FakeSocketProvider: React.FC<FakeSocketProviderProps> = ({ children }) => {
  const addBotMessage = useMessageStore((s) => s.addBotMessage);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Функция для отправки случайного сообщения от бота
    const sendBotMessage = () => {
      try {
        // Проверяем доступность сообщений бота
        if (!botMessages || botMessages.length === 0) {
          console.warn('FakeSocketProvider: Нет доступных сообщений бота');
          return;
        }

        // Выбираем случайное сообщение
        const randomIndex = Math.floor(Math.random() * botMessages.length);
        const randomMessage = botMessages[randomIndex];
        
        // Валидируем сообщение
        if (!randomMessage || typeof randomMessage !== 'string') {
          console.warn('FakeSocketProvider: Невалидное сообщение бота', randomMessage);
          return;
        }

        // Создаем сообщение от бота (sender: "other")
        const botMessage = {
          id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: randomMessage,
          sender: "other" as const,
          timestamp: Date.now(),
          status: "sent" as const,
        };

        // Добавляем сообщение от бота
        addBotMessage(randomMessage);
        
        console.log('FakeSocketProvider: Сообщение бота отправлено', randomMessage);
      } catch (error) {
        console.warn('❌ Error sending bot message:', error);
      }
    };

    // Устанавливаем интервал (5-10 секунд случайно)
    const startInterval = () => {
      try {
        // Очищаем предыдущий интервал
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
          intervalRef.current = null;
        }
        
        const delay = Math.random() * 5000 + 5000; // 5-10 секунд
        
        intervalRef.current = setTimeout(() => {
          try {
            sendBotMessage();
            startInterval(); // Рекурсивно устанавливаем следующий интервал
          } catch (error) {
            console.error('FakeSocketProvider: Ошибка в интервале', error);
          }
        }, delay);
        
        console.log('FakeSocketProvider: Интервал установлен', delay);
      } catch (error) {
        console.error('FakeSocketProvider: Ошибка установки интервала', error);
      }
    };

    // Запускаем первый интервал
    try {
      startInterval();
    } catch (error) {
      console.error('FakeSocketProvider: Ошибка запуска интервала', error);
    }

    // Очистка при размонтировании
    return () => {
      try {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
          intervalRef.current = null;
          console.log('FakeSocketProvider: Интервал очищен');
        }
      } catch (error) {
        console.error('FakeSocketProvider: Ошибка очистки интервала', error);
      }
    };
  }, []); // Убираем addBotMessage из зависимостей, так как она стабильна

  return <>{children}</>;
}; 