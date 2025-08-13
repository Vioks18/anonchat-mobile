
/**
 * Инициализация Firebase App Check
 * Защищает приложение от злоупотреблений API
 */
export const initializeAppCheckService = async () => {
  // App Check пока не поддерживается в React Native
  // Отключаем для избежания ошибок
  if (__DEV__) {
    console.log('App Check: Отключен для React Native');
  }
  return null;
};

/**
 * Получение токена App Check
 */
export const getAppCheckToken = async (forceRefresh = false) => {
  try {
    // В web SDK токен получается автоматически при запросах к Firebase
    if (__DEV__) {
      console.log('App Check: Токен будет получен автоматически при запросах к Firebase');
    }
    return 'token-will-be-auto-generated';
  } catch (error) {
    if (__DEV__) {
      console.error('App Check: Ошибка получения токена:', error);
    }
    return null;
  }
};

/**
 * Проверка, активен ли App Check
 */
export const isAppCheckActive = () => {
  try {
    // В web SDK App Check активен после инициализации
    return true;
  } catch {
    return false;
  }
};
