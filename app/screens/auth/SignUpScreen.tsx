// Extracted/added for Email+Password auth on 2025-08-13. No UX changes to chat.

import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AuthButton from '../../components/auth/AuthButton';
import AuthTextField from '../../components/auth/AuthTextField';
import CustomAlert from '../../components/ui/CustomAlert';
import { useToast } from '../../components/ui/Toast';
import { signUpWithEmail } from '../../services/auth';
import { isUsernameAvailable } from '../../services/authClient';
import { isStrongPassword, isValidEmail, isValidUsername } from '../../utils/authValidation';

export default function SignUpScreen() {
  const navigation = useNavigation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; username?: string }>({});
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = async () => {
    const emailValidation = isValidEmail(email);
    const passwordValidation = isStrongPassword(password);
    const usernameValidation = isValidUsername(username);
    
    const newErrors: { email?: string; password?: string; username?: string } = {};
    if (!emailValidation.isValid) newErrors.email = emailValidation.error;
    if (!passwordValidation.isValid) newErrors.password = passwordValidation.error;
    if (!usernameValidation.isValid) newErrors.username = usernameValidation.error;
    
    // Check username availability if format is valid
    if (usernameValidation.isValid) {
      try {
        const isAvailable = await isUsernameAvailable(username.toLowerCase());
        if (!isAvailable) {
          newErrors.username = 'Этот username уже занят';
        }
      } catch (error) {
        newErrors.username = 'Ошибка проверки username';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!(await validateForm())) return;
    
    setLoading(true);
    try {
      await signUpWithEmail({ email, password, username });
      toast.show({ message: 'Аккаунт успешно создан! Переход к чатам...' });
      
      // Навигация будет обработана автоматически через useAuth
      
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Попробуйте еще раз');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Создать аккаунт</Text>
        <Text style={styles.subtitle}>Присоединиться к AnonChat</Text>
        
        <View style={styles.form}>
          <AuthTextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Введите ваш email"
            keyboardType="email-address"
            error={errors.email}
          />
          
          <AuthTextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Введите пароль (минимум 6 символов)"
            secureTextEntry
            error={errors.password}
          />
          
          <AuthTextField
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="username (без @)"
            error={errors.username}
          />
          
          <AuthButton
            title="Создать аккаунт"
            onPress={handleSignUp}
            loading={loading}
          />
          
          <AuthButton
            title="Назад"
            onPress={() => navigation.goBack()}
            variant="secondary"
          />
        </View>
      </View>
      
      <CustomAlert
        visible={showError}
        title="Ошибка регистрации"
        message={errorMessage}
        type="error"
        onConfirm={() => setShowError(false)}
        onCancel={() => setShowError(false)}
      />
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e7e9ee',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9aa3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 8,
  },
});
