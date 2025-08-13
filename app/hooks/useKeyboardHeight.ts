import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent, Platform } from 'react-native';
import { GestureProbe } from '../utils/gestureProbe';

export const useKeyboardHeight = (): number => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
      if (__DEV__) {
        GestureProbe.log({ type: 'keyboardShow', t: Date.now() });
      }
      setKeyboardHeight(e.endCoordinates.height);
    });
    
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (__DEV__) {
        GestureProbe.log({ type: 'keyboardShow', t: Date.now() }); // Используем keyboardShow вместо keyboardHide
      }
      setKeyboardHeight(0);
    });

    // Дополнительные события для Android
    if (Platform.OS === 'android') {
      const willShowSubscription = Keyboard.addListener('keyboardWillShow', (e: KeyboardEvent) => {
        if (__DEV__) {
          GestureProbe.log({ type: 'keyboardShow', t: Date.now() }); // Используем keyboardShow вместо keyboardWillShow
        }
        // Предварительно устанавливаем высоту для плавности
        setKeyboardHeight(e.endCoordinates.height);
      });

      const willHideSubscription = Keyboard.addListener('keyboardWillHide', () => {
        if (__DEV__) {
          GestureProbe.log({ type: 'keyboardShow', t: Date.now() }); // Используем keyboardShow вместо keyboardWillHide
        }
        // Предварительно убираем высоту
        setKeyboardHeight(0);
      });

      return () => {
        showSubscription?.remove();
        hideSubscription?.remove();
        willShowSubscription?.remove();
        willHideSubscription?.remove();
      };
    }

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  return keyboardHeight;
};

export default useKeyboardHeight; 