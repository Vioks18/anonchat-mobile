import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';
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
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  return keyboardHeight;
};

export default useKeyboardHeight; 