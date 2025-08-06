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
    try {
      // console.log('FakeSocketProvider: Бот включен, запускаем интервал');
      const interval = setInterval(() => {
        try {
          const randomMessage = botMessages[Math.floor(Math.random() * botMessages.length)];
          addBotMessage(randomMessage);
        } catch (error) {
          console.error('FakeSocketProvider: Ошибка отправки сообщения бота', error);
        }
      }, 5000 + Math.random() * 10000); // 5-15 секунд
      
      return () => {
        try {
          clearInterval(interval);
          // console.log('FakeSocketProvider: Интервал бота очищен');
        } catch (error) {
          console.error('FakeSocketProvider: Ошибка очистки интервала', error);
        }
      };
    } catch (error) {
      console.error('FakeSocketProvider: Ошибка в useEffect', error);
    }
  }, [addBotMessage]);

  return <>{children}</>;
}; 

// Default export для Expo Router
export default FakeSocketProvider; 