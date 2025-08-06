import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Message } from '../types/message';

interface ReplyPreviewProps {
  replyTo: Message | null;
  setReplyTo: (message: Message | null) => void;
  styles: any;
  themedStyles: any;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  replyTo,
  setReplyTo,
  styles,
  themedStyles,
}) => {
  // Безопасная обработка закрытия превью
  const handleClose = useCallback(() => {
    try {
      setReplyTo(null);
    } catch (error) {
      console.error('ReplyPreview: Ошибка закрытия превью', error);
    }
  }, [setReplyTo]);

  // Валидация replyTo
  const isValidReplyTo = React.useMemo(() => {
    try {
      if (!replyTo) return false;
      
      // Проверяем обязательные поля
      if (!replyTo.text || typeof replyTo.text !== 'string') {
        console.warn('ReplyPreview: Невалидный текст ответа', replyTo);
        return false;
      }

      if (!replyTo.id || typeof replyTo.id !== 'string') {
        console.warn('ReplyPreview: Невалидный ID ответа', replyTo);
        return false;
      }

      return true;
    } catch (error) {
      console.error('ReplyPreview: Ошибка валидации replyTo', error);
      return false;
    }
  }, [replyTo]);

  if (!isValidReplyTo || !replyTo) return null;

  try {
    return (
      <View style={styles.replyPreviewContainer}>
        <View style={styles.replyPreviewContent}>
          <Text style={styles.replyPreviewLabel}>Ответ на:</Text>
          <Text style={styles.replyPreviewText} numberOfLines={1}>
            {replyTo.text}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.replyPreviewClose}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color="#aaa" />
        </TouchableOpacity>
      </View>
    );
  } catch (error) {
    console.error('ReplyPreview: Ошибка рендеринга', error);
    return null;
  }
}; 