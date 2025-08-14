// Extracted/added for Email+Password auth on 2025-08-13. No UX changes to chat.

import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import AuthButton from '../../components/auth/AuthButton';
import AuthTextField from '../../components/auth/AuthTextField';
import CustomAlert from '../../components/ui/CustomAlert';
import { useToast } from '../../components/ui/Toast';
import { sendResetEmail } from '../../services/auth';
import { isValidEmail } from '../../utils/authValidation';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const emailValidation = isValidEmail(email);
    
    const newErrors: { email?: string } = {};
    if (!emailValidation.isValid) newErrors.email = emailValidation.error;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await sendResetEmail(email);
      toast.show({ message: 'Письмо для сброса пароля отправлено! Проверьте почту.' });
      navigation.goBack();
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
        <Text style={styles.title}>Сброс пароля</Text>
        <Text style={styles.subtitle}>Введите email для получения ссылки сброса</Text>
        
        <View style={styles.form}>
          <AuthTextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Введите ваш email"
            keyboardType="email-address"
            error={errors.email}
          />
          
          <AuthButton
            title="Отправить ссылку"
            onPress={handleResetPassword}
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
        title="Ошибка сброса пароля"
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
