import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import CustomAlert from '../../components/ui/CustomAlert';
import { toast } from '../../components/ui/Toast';
import { useAuth } from '../../hooks/useAuth';
import { checkUsernameAvailable, linkAnonToEmail, registerWithEmail } from '../../services/authApi';
import { RegisterData } from '../../types/user';
import { debouncedAvailabilityCheck, getValidationMessage, validateUsername } from '../../utils/username';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    username: ''
  });
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{ visible: boolean; message?: string }>({ visible: false });

  const isAnonymous = user && !user.email;

  // Check username availability on change
  useEffect(() => {
    if (!formData.username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    const validation = validateUsername(formData.username);
    if (!validation.isValid) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    debouncedAvailabilityCheck(
      checkUsernameAvailable,
      formData.username
    )?.then((available) => {
      setUsernameAvailable(available);
      setCheckingUsername(false);
    });
  }, [formData.username]);

  const handleRegister = async () => {
    if (!formData.email.trim() || !formData.password.trim() || !formData.username.trim()) {
      setErrorAlert({ visible: true, message: 'Пожалуйста, заполните все поля' });
      return;
    }

    if (formData.password.length < 6) {
      setErrorAlert({ visible: true, message: 'Пароль должен содержать минимум 6 символов' });
      return;
    }

    const validation = validateUsername(formData.username);
    if (!validation.isValid) {
      setErrorAlert({ visible: true, message: getValidationMessage(validation.error) });
      return;
    }

    if (usernameAvailable === false) {
      setErrorAlert({ visible: true, message: 'Этот username уже занят' });
      return;
    }

    setLoading(true);
    try {
      if (isAnonymous) {
        await linkAnonToEmail(formData);
        toast.show({
          type: 'success',
          title: 'Успех',
          message: 'Аккаунт успешно привязан!',
        });
      } else {
        await registerWithEmail(formData);
        toast.show({
          type: 'success',
          title: 'Успех',
          message: 'Аккаунт успешно создан!',
        });
      }
      
      // Navigation will be handled by RootNavigator
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка';
      setErrorAlert({ visible: true, message });
    } finally {
      setLoading(false);
    }
  };

  const getUsernameStatus = () => {
    if (!formData.username.trim()) return null;
    
    const validation = validateUsername(formData.username);
    if (!validation.isValid) {
      return { color: '#ff6b6b', text: getValidationMessage(validation.error) };
    }

    if (checkingUsername) {
      return { color: '#f39c12', text: 'Проверка...' };
    }

    if (usernameAvailable === true) {
      return { color: '#00b894', text: 'Доступен' };
    }

    if (usernameAvailable === false) {
      return { color: '#ff6b6b', text: 'Занят' };
    }

    return null;
  };

  const usernameStatus = getUsernameStatus();

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
          <Text style={styles.title}>
            {isAnonymous ? 'Привязать аккаунт' : 'Создать аккаунт'}
          </Text>
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
              placeholder="Минимум 6 символов"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="@username"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {usernameStatus && (
              <View style={styles.statusContainer}>
                {checkingUsername && <ActivityIndicator size="small" color={usernameStatus.color} />}
                <Text style={[styles.statusText, { color: usernameStatus.color }]}>
                  {usernameStatus.text}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isAnonymous ? 'Привязать аккаунт' : 'Создать аккаунт'}
              </Text>
            )}
          </TouchableOpacity>

                     <TouchableOpacity
             style={styles.linkButton}
             onPress={() => navigation.navigate('Login' as never)}
             disabled={loading}
           >
            <Text style={styles.linkText}>
              {isAnonymous ? 'Уже есть аккаунт? Войти' : 'Уже есть аккаунт? Войти'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <CustomAlert
        visible={errorAlert.visible}
        type="error"
        title="Ошибка"
        message={errorAlert.message}
        onConfirm={() => setErrorAlert({ visible: false, message: '' })}
      />
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 8,
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

export default RegisterScreen;
