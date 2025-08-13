import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { loginWithEmail } from '../../services/authApi';
import { LoginData } from '../../types/user';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(formData);
      Alert.alert('Успех', 'Вход выполнен успешно!');
      
      // Navigation will be handled by RootNavigator
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка';
      Alert.alert('Ошибка', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
                     <TouchableOpacity 
             style={styles.backButton}
             onPress={() => navigation.goBack()}
           >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Войти в аккаунт</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите пароль"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Войти</Text>
            )}
          </TouchableOpacity>

                     <TouchableOpacity
             style={styles.linkButton}
             onPress={() => navigation.navigate('ForgotPassword' as never)}
             disabled={loading}
           >
            <Text style={styles.linkText}>Забыли пароль?</Text>
          </TouchableOpacity>

                     <TouchableOpacity
             style={styles.linkButton}
             onPress={() => navigation.navigate('Register' as never)}
             disabled={loading}
           >
            <Text style={styles.linkText}>Создать аккаунт</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  input: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  button: {
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#6c5ce7',
    fontFamily: 'Poppins-Regular',
  },
});

export default LoginScreen;
