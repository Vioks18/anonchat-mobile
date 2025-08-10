export const formatTimestamp = (timestamp: number) => {
  try {
    // Валидация входных данных
    if (!timestamp || typeof timestamp !== 'number' || isNaN(timestamp)) {
      if (__DEV__) console.warn('formatTimestamp: Невалидный timestamp', timestamp);
      return '--:--';
    }

    // Проверка на разумные границы времени
    const now = Date.now();
    const minTime = now - (365 * 24 * 60 * 60 * 1000); // 1 год назад
    const maxTime = now + (24 * 60 * 60 * 1000); // 1 день вперед

    if (timestamp < minTime || timestamp > maxTime) {
      if (__DEV__) console.warn('formatTimestamp: Timestamp вне разумных границ', timestamp);
      return '--:--';
    }

    const date = new Date(timestamp);
    
    // Проверка валидности созданной даты
    if (isNaN(date.getTime())) {
      if (__DEV__) console.warn('formatTimestamp: Невалидная дата', timestamp);
      return '--:--';
    }

    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    if (__DEV__) console.error('formatTimestamp: Ошибка форматирования времени', error);
    return '--:--';
  }
}; 

// Default export для Expo Router
export default formatTimestamp; 