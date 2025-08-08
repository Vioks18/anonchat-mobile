import { useCallback, useEffect, useState } from 'react';
import { UIManager, findNodeHandle } from 'react-native';

export type ReactionAnchor = { x: number; y: number; w: number; h: number };

export const useReactionState = () => {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<ReactionAnchor | null>(null);
  const [visible, setVisible] = useState(false);

  const measureInWindowAsync = (ref: any): Promise<ReactionAnchor> => new Promise((res, rej) => {
    try {
      const node = findNodeHandle(ref);
      if (!node) {
        rej(new Error('No node handle'));
        return;
      }
      
      UIManager.measureInWindow(node, (x, y, w, h) => {
        try {
          if (typeof x === 'number' && typeof y === 'number' && typeof w === 'number' && typeof h === 'number') {
            res({ x, y, w, h });
          } else {
            rej(new Error('Invalid measurement values'));
          }
        } catch (error) {
          rej(new Error(`Measurement callback error: ${error}`));
        }
      });
    } catch (error) {
      rej(new Error(`measureInWindowAsync error: ${error}`));
    }
  });

  const openAtMessage = useCallback(async (messageId: string, viewRef: any) => {
    try {
      if (!viewRef || !messageId) {
        console.warn('openAtMessage: Невалидные параметры', { messageId, hasRef: !!viewRef });
        return;
      }
      
      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => setTimeout(r, 0)); // android layout settle
      const a = await measureInWindowAsync(viewRef);
      setSelectedMessageId(messageId);
      setAnchor(a);
      setVisible(true);
    } catch (error) {
      console.error('openAtMessage: Ошибка открытия панели', error);
      // без якоря не открываем, чтобы не улетало на (0,0)
      setVisible(false);
    }
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setSelectedMessageId(null);
    setAnchor(null);
  }, []);

  useEffect(() => {
    // Убираем автоматическое закрытие по клавиатуре
    // const s1 = Keyboard.addListener('keyboardDidShow', close);
    // const s2 = Keyboard.addListener('keyboardWillShow', close);
    // return () => { s1.remove(); s2.remove(); };
  }, [close]);

  return {
    selectedMessageId,
    anchor,
    visible,
    openAtMessage,
    close
  };
};

export default useReactionState;
