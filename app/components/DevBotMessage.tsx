import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { DevBotMessage as DevBotMessageType } from '../hooks/useDevBotCommands';

interface DevBotMessageProps {
  message: DevBotMessageType;
  themedStyles: {
    bubbleMe: any;
    bubbleOther: any;
    bubbleText: any;
  };
}

const DevBotMessage: React.FC<DevBotMessageProps> = ({ message, themedStyles }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Анимация появления
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Определяем градиенты и стили в зависимости от типа сообщения
  const getMessageStyle = () => {
    switch (message.type) {
      case 'success':
        return {
          colors: ['#4CAF50', '#45a049'] as const,
          icon: 'checkmark-circle',
          borderColor: '#45a049',
          shadowColor: '#4CAF50',
        };
      case 'error':
        return {
          colors: ['#f44336', '#d32f2f'] as const,
          icon: 'close-circle',
          borderColor: '#d32f2f',
          shadowColor: '#f44336',
        };
      case 'info':
        return {
          colors: ['#2196F3', '#1976D2'] as const,
          icon: 'information-circle',
          borderColor: '#1976D2',
          shadowColor: '#2196F3',
        };
      default:
        return {
          colors: ['#FF9800', '#F57C00'] as const,
          icon: 'settings',
          borderColor: '#F57C00',
          shadowColor: '#FF9800',
        };
    }
  };

  const messageStyle = getMessageStyle();

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <View style={[styles.bubble, { borderColor: messageStyle.borderColor }]}>
        <LinearGradient
          colors={messageStyle.colors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={messageStyle.icon as any} 
                size={18} 
                color="#fff" 
              />
            </View>
            <Text style={styles.botLabel}>DevBot</Text>
            <View style={styles.statusDot} />
          </View>
          
          <Text style={styles.messageText}>
            {message.text}
          </Text>
          
          <View style={styles.footer}>
            <Text style={styles.timestamp}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </Text>
            <View style={styles.typeIndicator}>
              <Text style={styles.typeText}>
                {message.type.toUpperCase()}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '95%',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
    minWidth: 280,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    opacity: 0.8,
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'left',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.8,
  },
  typeIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default DevBotMessage;
