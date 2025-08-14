// Extracted/added for Email+Password auth on 2025-08-13. No UX changes to chat.

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthButton from '../../components/auth/AuthButton';
import { ProviderKind } from '../../types/auth';

export default function AuthLanding() {
  const navigation = useNavigation();

  const handleProviderSelect = (provider: ProviderKind) => {
    switch (provider) {
      case 'email':
        navigation.navigate('Login' as never);
        break;
      case 'guest':
        // TODO: Implement guest sign-in
        break;
      default:
        // Placeholder for future providers
        break;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AnonChat</Text>
        <Text style={styles.subtitle}>Приватный мессенджер</Text>
        
        <View style={styles.providerList}>
          <AuthButton
            title="Войти по Email"
            onPress={() => handleProviderSelect('email')}
          />
          
          <AuthButton
            title="Создать аккаунт"
            onPress={() => navigation.navigate('SignUp' as never)}
            variant="secondary"
          />
          
          <AuthButton
            title="Забыли пароль?"
            onPress={() => navigation.navigate('ForgotPassword' as never)}
            variant="secondary"
          />
          
          {/* Placeholder providers */}
          <AuthButton
            title="Continue with Google"
            onPress={() => handleProviderSelect('google')}
            disabled={true}
            variant="secondary"
          />
          
          <AuthButton
            title="Continue with Phone"
            onPress={() => handleProviderSelect('phone')}
            disabled={true}
            variant="secondary"
          />
          
          {__DEV__ && (
            <AuthButton
              title="Continue as Guest"
              onPress={() => handleProviderSelect('guest')}
              variant="secondary"
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0b0d10',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e7e9ee',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9aa3af',
    textAlign: 'center',
    marginBottom: 48,
  },
  providerList: {
    gap: 12,
  },
});
