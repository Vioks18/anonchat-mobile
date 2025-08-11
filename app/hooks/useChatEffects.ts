import { useEffect, useRef } from 'react';
import { TextInput } from 'react-native';
import { useMessageStore } from './useMessageStore';

/**
 * Хук для эффектов чата (автоскролл и синхронизация)
 */
export const useChatEffects = (
  inputText: string,
  setSelectedMessages: (messages: Set<string>) => void,
  setSelectedMessagesCount: (count: number) => void
) => {
  const textInputRef = useRef<TextInput>(null);

  // Автоматический скролл к концу текста при изменении
  useEffect(() => {
    if (textInputRef.current && inputText.length > 0) {
      setTimeout(() => {
        textInputRef.current?.setNativeProps({
          selection: { start: inputText.length, end: inputText.length }
        });
      }, 100);
    }
  }, [inputText]);

  // Синхронизация с store
  useEffect(() => {
    const unsubscribe = useMessageStore.subscribe((state) => {
      setSelectedMessages(state.selectedIds);
      setSelectedMessagesCount(state.selectedIds.size);
    });
    
    return unsubscribe;
  }, [setSelectedMessages, setSelectedMessagesCount]);

  return {
    textInputRef,
  };
};
