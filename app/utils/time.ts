// Форматирование времени в HH:mm
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Форматирование даты для списка чатов
export const formatChatTime = (timestamp: number): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Сегодня - показываем время
    return formatTime(timestamp);
  } else if (diffDays === 1) {
    // Вчера
    return 'Вчера';
  } else if (diffDays < 7) {
    // На этой неделе - день недели
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[date.getDay()];
  } else {
    // Старые - дата
    return `${date.getDate()}.${date.getMonth() + 1}`;
  }
};

// Конвертация Firestore Timestamp в число
export const timestampToNumber = (timestamp: any): number => {
  if (timestamp?.seconds) {
    return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000;
  }
  return Date.now();
};
