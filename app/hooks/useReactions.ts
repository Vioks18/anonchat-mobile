import { useCallback, useMemo } from 'react';
import { EmojiType, ReactionSummary } from '../components/reactions/types';
import { useMessageStore } from './useMessageStore';

export const useReactions = (messageId: string) => {
  const message = useMessageStore((s) => s.getMessageById(messageId));
  const addReaction = useMessageStore((s) => s.addReaction);
  const removeReaction = useMessageStore((s) => s.removeReaction);

  // Мемоизированная агрегация реакций
  const summary: ReactionSummary[] = useMemo(() => {
    if (!message?.reactions || message.reactions.length === 0) {
      return [];
    }

    const reactionCounts = new Map<EmojiType, { count: number; reactedByMe: boolean }>();
    
    message.reactions.forEach((reaction) => {
      const emoji = reaction as EmojiType;
      const current = reactionCounts.get(emoji) || { count: 0, reactedByMe: false };
      
      reactionCounts.set(emoji, {
        count: current.count + 1,
        reactedByMe: current.reactedByMe || reaction === 'me' // Упрощенная логика для MVP
      });
    });

    return Array.from(reactionCounts.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      reactedByMe: data.reactedByMe
    }));
  }, [message?.reactions]);

  // Проверяем, есть ли у пользователя реакции на это сообщение
  const hasUserReactions = useMemo(() => {
    return summary.some(reaction => reaction.reactedByMe);
  }, [summary]);

  // Обработчик переключения реакции
  const onToggleReaction = useCallback((emoji: EmojiType) => {
    try {
      // Простое переключение через store
      addReaction(messageId, emoji);
      console.log('Переключение реакции:', emoji, 'для сообщения:', messageId);
    } catch (error) {
      console.error('useReactions: Ошибка переключения реакции', error);
    }
  }, [messageId, addReaction]);

  return {
    summary,
    hasUserReactions,
    onToggleReaction,
    totalReactions: summary.reduce((sum, r) => sum + r.count, 0)
  };
};
