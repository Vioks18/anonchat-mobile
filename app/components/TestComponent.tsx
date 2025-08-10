import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TestComponent = () => {
  console.log('This should be wrapped in __DEV__');
  console.warn('This warning should also be wrapped');
  
  return (
    <View style={styles.container}>
      <Text style={styles.messageText}>
        This text needs minWidth: 0
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
    // Missing minWidth: 0
  },
});

export default TestComponent;
