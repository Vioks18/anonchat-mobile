// Файл с голыми console.log без __DEV__ обертки

export const badLogging = () => {
  console.log('Это должно быть в __DEV__');
  console.warn('И это тоже');
  
  // Правильный пример (но не в __DEV__)
  if (process.env.NODE_ENV === 'development') {
    console.log('Это правильно');
  }
  
  // Еще один голый лог
  console.log('Еще один без __DEV__');
};

export const goodLogging = () => {
  if (__DEV__) {
    console.log('Это правильно');
  }
};
