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
  const shadowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = [];
    
    if (isSelected) {
      // Анимация "pop-out" при выборе
      animations.push(
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.02,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(shadowAnim, {
            toValue: 1,
            duration,
            useNativeDriver: false,
          }),
        ])
      );
    } else {
      // Возврат к нормальному состоянию
      animations.push(
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(shadowAnim, {
            toValue: 0,
            duration,
            useNativeDriver: false,
          }),
        ])
      );
    }

    Animated.sequence(animations).start();
  }, [isSelected, scaleAnim, shadowAnim, duration]);

  return {
    scaleAnim,
    opacityAnim,
    shadowAnim,
    animatedStyle: {
      transform: [{ scale: scaleAnim }],
      opacity: opacityAnim,
    },
  };
}
