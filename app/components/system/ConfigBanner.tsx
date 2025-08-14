import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AI_CONFIG } from '../../config/ai';

export const ConfigBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (AI_CONFIG.isAIConfigured || !isVisible) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        AI не настроен — установите GEMINI_API_KEY в конфигурации Expo
      </Text>
      <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  closeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
