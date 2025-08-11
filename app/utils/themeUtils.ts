// Утилиты для работы с темами

/**
 * Функция для получения цвета тени в зависимости от темы
 * @param theme - объект темы
 * @param isMe - является ли сообщение своим
 * @returns цвет тени для пузыря сообщения
 */
export const getShadowColor = (theme: any, isMe: boolean): string => {
  if (isMe) {
    return theme.bubbleMe;
  } else {
    return theme.bubbleOther;
  }
};
