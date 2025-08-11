import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatCoreFallbackProps {
  error?: string;
}

// Fallback компонент для критических ошибок
const ChatCoreFallback: React.FC<ChatCoreFallbackProps> = ({ error }) => (
  <SafeAreaView style={styles.fallbackContainer}>
    <View style={styles.fallbackContent}>
      <Ionicons name="warning" size={48} color="#ff6b6b" />
      <Text style={styles.fallbackTitle}>Ошибка приложения</Text>
      <Text style={styles.fallbackText}>
        {error || "Произошла критическая ошибка. Попробуйте перезапустить приложение."}
      </Text>
      <TouchableOpacity 
        style={styles.fallbackButton}
        onPress={() => {
          // Попытка перезагрузки
          if (__DEV__) console.log('ChatCore: Попытка перезагрузки...');
        }}
      >
        <Text style={styles.fallbackButtonText}>Перезапустить</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181825',
  },
  fallbackContent: {
    alignItems: 'center',
    padding: 20,
  },
  fallbackTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  fallbackText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  fallbackButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatCoreFallback;
