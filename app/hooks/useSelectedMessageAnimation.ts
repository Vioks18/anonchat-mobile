import { useCallback, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useSelectedMessageAnimation = (isSelected: boolean) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(0)).current;

  const animateSelection = useCallback(() => {
    if (isSelected) {
      // Анимация выделения: scale 1.0 → 1.03 за 120ms
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.03,
          duration: 120,
          useNativeDriver: false,
        }),
        Animated.timing(shadowAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Анимация снятия выделения: возврат к нормальному состоянию
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: false,
        }),
        Animated.timing(shadowAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isSelected, scaleAnim, shadowAnim]);

  // Запускаем анимацию при изменении состояния
  useEffect(() => {
    animateSelection();
  }, [isSelected, animateSelection]);

  return {
    scaleAnim,
    shadowAnim,
    animateSelection,
  };
};

// Default export для Expo Router
const UseSelectedMessageAnimationComponent = () => null;
export default UseSelectedMessageAnimationComponent;
