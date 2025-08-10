import React from 'react';
import { View, Text } from 'react-native';

const BadBubble = () => {
  return (
    <View style={{ paddingBottom: 8 }}> {/* < 14 - должно быть >= 14 */}
      <Text>Сообщение</Text>
      <View style={{
        position: 'absolute',
        right: 4, // < 6 - должно быть >= 6
        bottom: 1, // < 2 - должно быть >= 2
      }}>
        <Text>12:34</Text>
      </View>
    </View>
  );
};

export default BadBubble;
