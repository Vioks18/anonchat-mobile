import { useCallback, useEffect, useState } from 'react';
import { findNodeHandle, Keyboard, UIManager } from 'react-native';
import { useMessageStore } from './useMessageStore';

export type ReactionAnchor = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export const useReactionState = () => {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<ReactionAnchor | null>(null);
  const [visible, setVisible] = useState(false);

  const addReaction = useMessageStore((s) => s.addReaction);

  // Асинхронное измерение позиции через UIManager
  const measureInWindowAsync = useCallback(async (ref: any): Promise<ReactionAnchor> => {
    return new Promise((resolve, reject) => {
      try {
        const nodeHandle = findNodeHandle(ref);
        if (!nodeHandle) {
          reject(new Error('Node handle not found'));
          return;
        }

        UIManager.measureInWindow(nodeHandle, (x, y, width, height) => {
          resolve({ x, y, w: width, h: height });
        });
      } catch (error) {
        reject(error);
      }
    });
  }, []);

  // Открытие панели с измерением позиции
  const openAtMessage = useCallback(async (messageId: string, viewRef: any) => {
    try {
      // Ждем кадр для стабилизации
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Небольшая задержка для inverted списков
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const measuredAnchor = await measureInWindowAsync(viewRef);
      
      // Проверяем валидность измерений
      if (measuredAnchor.x === 0 && measuredAnchor.y === 0 && measuredAnchor.w === 0 && measuredAnchor.h === 0) {
        console.warn('useReactionState: Invalid anchor measurements');
        return;
      }

      setSelectedMessageId(messageId);
      setAnchor(measuredAnchor);
      setVisible(true);
    } catch (error) {
      console.error('useReactionState: Ошибка открытия панели реакций', error);
      setVisible(false);
    }
  }, [measureInWindowAsync]);

  // Закрытие панели
  const close = useCallback(() => {
    setVisible(false);
    setSelectedMessageId(null);
    setAnchor(null);
  }, []);

  // Обработка выбора реакции
  const handleReactionSelect = useCallback((emoji: string) => {
    if (selectedMessageId) {
      try {
        addReaction(selectedMessageId, emoji);
        console.log('Добавлена реакция:', emoji, 'к сообщению:', selectedMessageId);
      } catch (error) {
        console.error('useReactionState: Ошибка добавления реакции', error);
      }
    }
    close();
  }, [selectedMessageId, addReaction, close]);

  // Закрытие по клавиатуре
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', close);
    const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', close);

    return () => {
      keyboardDidShowListener?.remove();
      keyboardWillShowListener?.remove();
    };
  }, [close]);

  return {
    selectedMessageId,
    anchor,
    visible,
    openAtMessage,
    close,
    handleReactionSelect,
  };
};

export default useReactionState;
