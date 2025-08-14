import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface AvatarProps {
  displayName?: string;
  username?: string;
  avatarURL?: string;
  size?: number;
  onColorChange?: (colorIndex: number) => void;
  onReset?: () => void;
  currentColorIndex?: number;
}

const AVATAR_COLORS = [
  '#6c5ce7', // Purple
  '#00b894', // Green
  '#fdcb6e', // Yellow
  '#e17055', // Orange
  '#74b9ff', // Blue
  '#fd79a8', // Pink
];

const Avatar: React.FC<AvatarProps> = React.memo(({
  displayName,
  username,
  avatarURL,
  size = 128,
  onColorChange,
  onReset,
  currentColorIndex = 0,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const getInitials = () => {
    const name = displayName || username || '';
    const words = name.trim().split(' ').filter(word => word.length > 0);
    
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    
    return '?';
  };

  const handlePress = () => {
    if (onColorChange) {
      const nextIndex = (currentColorIndex + 1) % AVATAR_COLORS.length;
      onColorChange(nextIndex);
      
      // Плавная анимация изменения цвета
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 75,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 75,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]),
      ]).start();
    }
  };

  const handleLongPress = () => {
    if (onReset) {
      Alert.alert(
        'Сбросить аватар',
        'Вернуть к инициалам?',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Сбросить', onPress: onReset },
        ]
      );
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const backgroundColor = AVATAR_COLORS[currentColorIndex];
  const fontSize = Math.max(size * 0.4, 24);

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.container,
        Platform.OS === 'ios' && pressed && styles.pressed
      ]}
      android_ripple={{ 
        color: 'rgba(255,255,255,0.2)', 
        borderless: true,
        radius: size / 2,
      }}
      accessibilityRole="image"
      accessibilityLabel={`Аватар пользователя ${displayName || username || ''}`}
      accessibilityHint="Нажмите для смены цвета, долгое нажатие для сброса"
    >
      <Animated.View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {avatarURL ? (
          // TODO: Добавить Image когда будет доступен
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image" size={size * 0.3} color="#fff" />
          </View>
        ) : (
          <Text style={[styles.initials, { fontSize }]}>
            {getInitials()}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Avatar;
