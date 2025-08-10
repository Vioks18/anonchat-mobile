import React from 'react';
import { View } from 'react-native';

const ReactionBar = ({ visible, anchor }: { visible: boolean; anchor: any }) => {
  // Нет проверки if (!visible || !anchor) return null;
  
  return (
    <View style={{ position: 'absolute' }}>
      <View>Реакции</View>
    </View>
  );
};

export default ReactionBar;
