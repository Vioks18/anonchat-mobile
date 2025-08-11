import { Message } from '../types/message';

/**
 * Константы для работы с сообщениями
 */

// Инициализируем с пустым массивом
export const INITIAL_MESSAGES: Message[] = [];

// Максимальная длина сообщения для разбиения
export const MAX_MESSAGE_LENGTH = 1000;

// Задержки для имитации отправки сообщений
export const MESSAGE_DELAYS = {
  SENDING: 1000,
  SENT: 500,
  DELIVERED: 1000,
  BETWEEN_PARTS: 200,
} as const;

// Префиксы для ID сообщений
export const MESSAGE_ID_PREFIXES = {
  BOT: 'bot_',
} as const;

// Статусы сообщений
export const MESSAGE_STATUSES = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
} as const;

// Отправители сообщений
export const MESSAGE_SENDERS = {
  ME: 'me',
  OTHER: 'other',
} as const;
