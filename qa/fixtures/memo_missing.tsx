import React from 'react';
import { View, Text } from 'react-native';

// Компонент без React.memo - должен триггерить правило
const MessageItem = ({ message }: { message: string }) => {
  return (
    <View>
      <Text>{message}</Text>
    </View>
  );
};

// Экспорт без memo
export default MessageItem;
