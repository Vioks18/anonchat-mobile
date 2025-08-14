import { useEffect } from 'react';
import { AppState } from 'react-native';

export function useAppFocus(onActive: () => void) {
  useEffect(() => {
    let last = AppState.currentState;
    const sub = AppState.addEventListener('change', (s) => {
      if (last !== 'active' && s === 'active') onActive();
      last = s;
    });
    return () => sub.remove();
  }, [onActive]);
}
