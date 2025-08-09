import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useMessageStore } from '../hooks/useMessageStore';
import { Message } from '../types/message';

interface ReplyPreviewProps {
  replyTo: Message | null;
  setReplyTo: (message: Message | null) => void;
  styles: any;
  themedStyles: any;
}

const ReplyPreviewInner: React.FC<ReplyPreviewProps> = React.memo(({ replyTo, setReplyTo, styles, themedStyles }) => {
  const draft = useMessageStore((s: any) => s.replyDraft);
  const clearDraft = useMessageStore((s: any) => s.setReplyDraft);
  // Безопасная обработка закрытия превью
  const handleClose = useCallback(() => {
    try {
      setReplyTo(null);
    } catch (error) {
      if (__DEV__) console.error('ReplyPreview: Ошибка закрытия превью', error);
    }
  }, [setReplyTo]);

  // Валидация replyTo
  const isValidReplyTo = React.useMemo(() => {
    try {
      if (!replyTo) return false;
      
      // Проверяем обязательные поля
      if (!replyTo.text || typeof replyTo.text !== 'string') {
        if (__DEV__) console.warn('ReplyPreview: Невалидный текст ответа', replyTo);
        return false;
      }

      if (!replyTo.id || typeof replyTo.id !== 'string') {
        if (__DEV__) console.warn('ReplyPreview: Невалидный ID ответа', replyTo);
        return false;
      }

      return true;
    } catch (error) {
      if (__DEV__) console.error('ReplyPreview: Ошибка валидации replyTo', error);
      return false;
    }
  }, [replyTo]);

  const target = draft || replyTo;
  if (!target) return null;

  try {
    return (
      <View style={styles.replyPreviewContainer}>
        <View style={styles.replyPreviewContent}>
          <Text style={styles.replyPreviewLabel}>Ответ на:</Text>
          <Text style={styles.replyPreviewText} numberOfLines={1}>
            {target.text}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.replyPreviewClose}
          onPress={() => { clearDraft?.(null); handleClose(); }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color="#aaa" />
        </TouchableOpacity>
      </View>
    );
  } catch (error) {
    if (__DEV__) console.error('ReplyPreview: Ошибка рендеринга', error);
    return null;
  }
});

ReplyPreviewInner.displayName = 'ReplyPreview';

// Экспортируем как default для Expo Router
export default ReplyPreviewInner;

// Также экспортируем как named export для обратной совместимости
export const ReplyPreview = ReplyPreviewInner; 