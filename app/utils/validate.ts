/**
 * Валидация отображаемого имени
 * @param value - значение для валидации
 * @returns строка с ошибкой или null если валидно
 */
export const validateDisplayName = (value: string): string | null => {
  const trimmed = value.trim();
  
  if (!trimmed) {
    return 'Имя не может быть пустым';
  }
  
  if (trimmed.length < 1) {
    return 'Имя должно содержать минимум 1 символ';
  }
  
  if (trimmed.length > 32) {
    return 'Имя не может быть длиннее 32 символов';
  }
  
  // Проверка на управляющие символы
  const controlCharsRegex = /[\x00-\x1F\x7F]/;
  if (controlCharsRegex.test(trimmed)) {
    return 'Имя содержит недопустимые символы';
  }
  
  // Проверка на множественные пробелы
  if (/\s{2,}/.test(trimmed)) {
    return 'Уберите лишние пробелы';
  }
  
  return null;
};

/**
 * Нормализация отображаемого имени
 * @param value - значение для нормализации
 * @returns нормализованное значение
 */
export const normalizeDisplayName = (value: string): string => {
  return value
    .trim()
    .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
    .replace(/[\x00-\x1F\x7F]/g, ''); // Удаляем управляющие символы
};

/**
 * Валидация username (только для отображения)
 * @param value - значение для валидации
 * @returns строка с ошибкой или null если валидно
 */
export const validateUsername = (value: string): string | null => {
  if (!value) {
    return null; // Пустой username допустим
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length < 3) {
    return 'Username должен содержать минимум 3 символа';
  }
  
  if (trimmed.length > 20) {
    return 'Username не может быть длиннее 20 символов';
  }
  
  // Проверка на допустимые символы
  const validCharsRegex = /^[a-zA-Z0-9_]+$/;
  if (!validCharsRegex.test(trimmed)) {
    return 'Username может содержать только буквы, цифры и подчеркивания';
  }
  
  return null;
};

/**
 * Форматирование username для отображения
 * @param username - username для форматирования
 * @returns отформатированный username с @
 */
export const formatUsername = (username?: string): string => {
  if (!username) {
    return 'Нет username';
  }
  
  return username.startsWith('@') ? username : `@${username}`;
};
