import React from 'react';
import { Text, View } from 'react-native';

const BadText = () => {
  return (
    <View style={{ flexDirection: 'row' }}>
      <Text style={{ 
        // нет minWidth: 0
        // нет flexShrink: 1
      }}>
        Длинное сообщение которое должно сжиматься но не сжимается из-за отсутствия minWidth: 0
      </Text>
    </View>
  );
};

export default BadText;
