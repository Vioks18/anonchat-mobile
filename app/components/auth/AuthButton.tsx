// Extracted/added for Email+Password auth on 2025-08-13. No UX changes to chat.

import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export default function AuthButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary'
}: AuthButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        (disabled || loading) && styles.disabledButton
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0a0f0c' : '#e7e9ee'} />
      ) : (
        <Text style={[
          styles.buttonText,
          variant === 'primary' ? styles.primaryText : styles.secondaryText,
          (disabled || loading) && styles.disabledText
        ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#86efac',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#0a0f0c',
  },
  secondaryText: {
    color: '#e7e9ee',
  },
  disabledText: {
    opacity: 0.7,
  },
});
