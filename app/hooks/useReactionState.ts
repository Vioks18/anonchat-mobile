import { useCallback, useRef, useState } from 'react';
import { GestureProbe } from '../utils/gestureProbe';
import { useKeyboardHeight } from './useKeyboardHeight';

export type ReactionAnchor = {
  x: number;
  y: number;
  w: number;
  h: number;
  touchX?: number;
  touchY?: number;
};

export const useReactionState = () => {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<ReactionAnchor | null>(null);
  const [visible, setVisible] = useState(false);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const keyboardHeight = useKeyboardHeight();

  const setLastTouch = useCallback((x?: number, y?: number) => {
    if (typeof x === 'number' && typeof y === 'number') {
      lastTouchRef.current = { x, y };
    }
  }, []);

  const openAtMessage = useCallback((messageId: string, viewRef: any) => {
    if (!viewRef) return;

    // Добавляем проверку и стабилизацию
    try {
      viewRef.measureInWindow((x: number, y: number, w: number, h: number) => {
        // Проверяем валидность координат
        if (typeof x !== 'number' || typeof y !== 'number' || typeof w !== 'number' || typeof h !== 'number') {
          console.warn('Invalid measureInWindow result:', { x, y, w, h });
          return;
        }

        const baseAnchor: ReactionAnchor = { x, y, w, h };
        
        if (lastTouchRef.current) {
          setAnchor({
            ...baseAnchor,
            touchX: lastTouchRef.current.x,
            touchY: lastTouchRef.current.y,
          });
        } else {
          setAnchor(baseAnchor);
        }
        
        setSelectedMessageId(messageId);
        setVisible(true);
        
        if (__DEV__) {
          GestureProbe.log({
            type: 'openReaction',
            t: Date.now(),
            msgId: messageId,
            x: lastTouchRef.current?.x,
            y: lastTouchRef.current?.y
          });
        }
      });
    } catch (error) {
      console.warn('Error in openAtMessage:', error);
      // Fallback - устанавливаем базовое состояние
      setSelectedMessageId(messageId);
      setVisible(true);
    }
  }, []);

  const close = useCallback(() => {
    if (__DEV__) {
      GestureProbe.log({ type: 'closeReaction', t: Date.now() });
    }
    setVisible(false);
    setAnchor(null);
    lastTouchRef.current = null;
  }, []);

  return {
    selectedMessageId,
    anchor,
    visible,
    openAtMessage,
    close,
    setLastTouch,
    keyboardHeight,
    setSelectedMessageId,
    setVisible,
    setAnchor,
  };
};

export default useReactionState;
