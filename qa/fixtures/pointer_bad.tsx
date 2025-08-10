import React from 'react';
import { View } from 'react-native';

const BadPointer = () => {
  return (
    <View style={{ position: 'absolute' }}>
      <View pointerEvents="auto"> {/* Внешний должен быть box-none */}
        <View pointerEvents="none"> {/* Внутренний должен быть auto */}
          <View>Реакция</View>
        </View>
      </View>
    </View>
  );
};

export default BadPointer;
