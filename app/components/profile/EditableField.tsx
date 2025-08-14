import React, { useState, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EditableFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  editable?: boolean;
  onValueChange: (value: string) => void;
  onLongPress?: () => void;
  validation?: (value: string) => string | null;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  accessibilityLabel?: string;
}

const EditableField: React.FC<EditableFieldProps> = React.memo(({
  label,
  value,
  placeholder,
  editable = true,
  onValueChange,
  onLongPress,
  validation,
  maxLength,
  autoCapitalize = 'words',
  keyboardType = 'default',
  accessibilityLabel,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (editable && !isEditing) {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress();
    }
  };

  const handleValueChange = (newValue: string) => {
    onValueChange(newValue);
    
    // Валидация в реальном времени
    if (validation) {
      const validationError = validation(newValue);
      setError(validationError);
      
      // Анимация тряски при ошибке
      if (validationError) {
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        // Показываем ошибку с анимацией
        Animated.spring(errorAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } else {
        // Скрываем ошибку с анимацией
        Animated.spring(errorAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Очищаем ошибку при потере фокуса
    setTimeout(() => {
      setError(null);
      Animated.spring(errorAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }, 100);
  };

  const handleSubmit = () => {
    setIsEditing(false);
    setError(null);
    Animated.spring(errorAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const isReadOnly = !editable || !isEditing;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={({ pressed }) => [
          styles.fieldContainer,
          Platform.OS === 'ios' && pressed && styles.pressed,
        ]}
        android_ripple={{ 
          color: 'rgba(108, 92, 231, 0.1)', 
          borderless: false 
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `${label} поле`}
        accessibilityHint={editable ? "Нажмите для редактирования" : "Только для чтения"}
      >
        {isReadOnly ? (
          <View style={styles.readOnlyContainer}>
            <Text style={[
              styles.readOnlyText,
              !value && styles.placeholderText
            ]}>
              {value || placeholder || 'Не указано'}
            </Text>
            {editable && (
              <Ionicons name="pencil" size={16} color="#888" />
            )}
          </View>
        ) : (
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={value}
            onChangeText={handleValueChange}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmit}
            placeholder={placeholder}
            placeholderTextColor="#888"
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            returnKeyType="done"
            autoCorrect={false}
            accessibilityLabel={`Редактировать ${label.toLowerCase()}`}
          />
        )}
      </Pressable>
      
      <Animated.View 
        style={[
          styles.errorContainer,
          {
            opacity: errorAnim,
            transform: [
              {
                translateY: errorAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                })
              }
            ],
          },
        ]}
        pointerEvents={error ? 'auto' : 'none'}
      >
        {error && (
          <>
            <Ionicons name="alert-circle" size={14} color="#ff6b6b" />
            <Text style={styles.errorText}>{error}</Text>
          </>
        )}
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  fieldContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.8,
  },
  readOnlyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    flex: 1,
  },
  placeholderText: {
    color: '#888',
  },
  input: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    padding: 0,
    margin: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
    minHeight: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
});

export default EditableField;
