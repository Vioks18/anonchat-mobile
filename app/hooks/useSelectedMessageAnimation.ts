import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

interface UseSelectedMessageAnimationProps {
  isSelected: boolean;
  duration?: number;
}

export function useSelectedMessageAnimation({ 
  isSelected, 
  duration = 200 
}: UseSelectedMessageAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSelected) {
      // Анимация "pop-out" при выборе
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Возврат к нормальному состоянию
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSelected, scaleAnim, duration]);

  return {
    scaleAnim,
    opacityAnim,
    animatedStyle: {
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    },
  };
}
