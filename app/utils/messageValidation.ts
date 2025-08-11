/**
 * Утилиты для валидации сообщений
 */

// Безопасная валидация сообщения
export const validateMessage = (text: string): boolean => {
  try {
    return typeof text === 'string' && text.trim().length > 0;
  } catch (error) {
    if (__DEV__) console.error('validateMessage: Ошибка валидации', error);
    return false;
  }
};

// Безопасная генерация ID
export const generateId = (): string => {
  try {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
  } catch (error) {
    if (__DEV__) console.error('generateId: Ошибка генерации ID', error);
    return Date.now().toString();
  }
};

// Разбиение длинных сообщений на части
export const splitLongMessage = (text: string, maxLength: number = 1000): string[] => {
  try {
    if (text.length <= maxLength) {
      return [text];
    }
    
    const parts: string[] = [];
    let currentPart = '';
    
    // Разбиваем по словам, чтобы не резать слова пополам
    const words = text.split(' ');
    
    for (const word of words) {
      // Если добавление слова превысит лимит, начинаем новую часть
      if ((currentPart + ' ' + word).trim().length > maxLength) {
        if (currentPart.trim()) {
          parts.push(currentPart.trim());
        }
        currentPart = word;
      } else {
        currentPart += (currentPart ? ' ' : '') + word;
      }
    }
    
    // Добавляем последнюю часть
    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }
    
    return parts;
  } catch (error) {
    if (__DEV__) console.error('splitLongMessage: Ошибка разбиения', error);
    return [text];
  }
};
