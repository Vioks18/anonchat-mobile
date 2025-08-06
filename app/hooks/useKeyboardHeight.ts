import { useCallback, useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Безопасная установка высоты клавиатуры
  const safeSetKeyboardHeight = useCallback((height: number) => {
    try {
      if (typeof height === 'number' && height >= 0) {
        setKeyboardHeight(height);
        setHasError(false);
      } else {
        console.warn('useKeyboardHeight: Невалидная высота клавиатуры', height);
        setHasError(true);
      }
    } catch (error) {
      console.error('useKeyboardHeight: Ошибка установки высоты', error);
      setHasError(true);
    }
  }, []);

  // Безопасная обработка показа клавиатуры
  const handleKeyboardShow = useCallback((e: any) => {
    try {
      if (e && e.endCoordinates) {
        setKeyboardHeight(e.endCoordinates.height);
        // console.log('useKeyboardHeight: Клавиатура показана', e.endCoordinates.height);
      }
    } catch (error) {
      console.error('useKeyboardHeight: Ошибка обработки показа клавиатуры', error);
    }
  }, []);

  // Безопасная обработка скрытия клавиатуры
  const handleKeyboardHide = useCallback(() => {
    try {
      setKeyboardHeight(0);
      // console.log('useKeyboardHeight: Клавиатура скрыта');
    } catch (error) {
      console.error('useKeyboardHeight: Ошибка обработки скрытия клавиатуры', error);
    }
  }, []);

  useEffect(() => {
    let keyboardDidShowListener: any = null;
    let keyboardDidHideListener: any = null;

    try {
      // Добавляем слушатели с обработкой ошибок
      keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

      console.log('useKeyboardHeight: Слушатели клавиатуры добавлены');
    } catch (error) {
      console.error('useKeyboardHeight: Ошибка добавления слушателей клавиатуры', error);
      setHasError(true);
    }

    return () => {
      try {
        // Безопасное удаление слушателей
        if (keyboardDidShowListener?.remove) {
          keyboardDidShowListener.remove();
        }
        if (keyboardDidHideListener?.remove) {
          keyboardDidHideListener.remove();
        }
        console.log('useKeyboardHeight: Слушатели клавиатуры удалены');
      } catch (error) {
        console.error('useKeyboardHeight: Ошибка удаления слушателей клавиатуры', error);
      }
    };
  }, [handleKeyboardShow, handleKeyboardHide]);

  return {
    keyboardHeight,
    hasError,
    isKeyboardVisible: keyboardHeight > 0
  };
}; 