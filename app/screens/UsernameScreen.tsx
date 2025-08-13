import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { 
  validateHandle, 
  checkUsernameAvailable, 
  claimUsername, 
  suggestRandomHandle 
} from '../services/usernames';
import { UsernameValidationError } from '../types/username';

const UsernameScreen: React.FC = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [validationError, setValidationError] = useState<UsernameValidationError | null>(null);
  const [availability, setAvailability] = useState<'checking' | 'available' | 'taken' | null>(null);

  // Debounced availability check
  useEffect(() => {
    if (!username.trim()) {
      setAvailability(null);
      return;
    }

    const validation = validateHandle(username);
    if (!validation.ok) {
      setValidationError(validation.reason);
      setAvailability(null);
      return;
    }

    setValidationError(null);
    setIsChecking(true);
    setAvailability('checking');

    const timeoutId = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailable(username);
        setAvailability(result.available ? 'available' : 'taken');
      } catch (error) {
        if (__DEV__) console.error('Error checking availability:', error);
        setAvailability('taken');
      } finally {
        setIsChecking(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSuggestUsername = useCallback(() => {
    if (user?.uid) {
      const suggestion = suggestRandomHandle(user.uid);
      setUsername(suggestion);
    }
  }, [user?.uid]);

  const handleClaimUsername = async () => {
    if (!user?.uid || !username.trim()) {
      Alert.alert('Ошибка', 'Введите имя пользователя');
      return;
    }

    const validation = validateHandle(username);
    if (!validation.ok) {
      Alert.alert('Ошибка', 'Некорректное имя пользователя');
      return;
    }

    setIsClaiming(true);
    try {
      const result = await claimUsername(username, user.uid);
      
      if (result.success) {
        Alert.alert(
          'Успех!', 
          `Имя @${result.display} успешно установлено!`,
          [{ text: 'OK' }]
        );
        // Navigation will be handled by the router
      } else {
        let errorMessage = 'Не удалось установить имя';
        switch (result.reason) {
          case 'taken':
            errorMessage = 'Это имя уже занято';
            break;
          case 'invalid':
            errorMessage = 'Некорректное имя пользователя';
            break;
          case 'reserved':
            errorMessage = 'Это имя зарезервировано';
            break;
          case 'network_error':
            errorMessage = 'Ошибка сети. Попробуйте еще раз';
            break;
        }
        Alert.alert('Ошибка', errorMessage);
      }
    } catch (error) {
      if (__DEV__) console.error('Error claiming username:', error);
      Alert.alert('Ошибка', 'Не удалось установить имя. Попробуйте еще раз');
    } finally {
      setIsClaiming(false);
    }
  };

  const getValidationMessage = (error: UsernameValidationError): string => {
    switch (error) {
      case 'too_short':
        return 'Имя должно содержать минимум 3 символа';
      case 'too_long':
        return 'Имя должно содержать максимум 20 символов';
      case 'invalid_chars':
        return 'Используйте только буквы, цифры и подчеркивания';
      case 'starts_with_underscore':
        return 'Имя не может начинаться с подчеркивания';
      case 'reserved_name':
        return 'Это имя зарезервировано';
      case 'empty':
        return 'Введите имя пользователя';
      default:
        return 'Некорректное имя';
    }
  };

  const isFormValid = username.trim() && 
    !validationError && 
    availability === 'available' && 
    !isChecking;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={64} color="#6c5ce7" />
          <Text style={styles.title}>Выберите имя</Text>
          <Text style={styles.subtitle}>
            Как вас будут видеть другие пользователи
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPrefix}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="ваше_имя"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              maxLength={20}
            />
          </View>

          {validationError && (
            <Text style={styles.errorText}>
              {getValidationMessage(validationError)}
            </Text>
          )}

          {availability === 'checking' && (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="small" color="#6c5ce7" />
              <Text style={styles.statusText}>Проверка...</Text>
            </View>
          )}

          {availability === 'available' && (
            <View style={styles.statusContainer}>
              <Ionicons name="checkmark-circle" size={16} color="#00b894" />
              <Text style={styles.availableText}>Имя доступно</Text>
            </View>
          )}

          {availability === 'taken' && (
            <View style={styles.statusContainer}>
              <Ionicons name="close-circle" size={16} color="#d63031" />
              <Text style={styles.takenText}>Имя уже занято</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.suggestButton}
          onPress={handleSuggestUsername}
        >
          <Ionicons name="shuffle" size={16} color="#6c5ce7" />
          <Text style={styles.suggestText}>Предложить имя</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !isFormValid && styles.continueButtonDisabled
          ]}
          onPress={handleClaimUsername}
          disabled={!isFormValid || isClaiming}
        >
          {isClaiming ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Продолжить</Text>
          )}
        </TouchableOpacity>

        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>Правила:</Text>
          <Text style={styles.rulesText}>• 3-20 символов</Text>
          <Text style={styles.rulesText}>• Буквы, цифры, подчеркивания</Text>
          <Text style={styles.rulesText}>• Не может начинаться с подчеркивания</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputPrefix: {
    fontSize: 18,
    color: '#6c5ce7',
    marginRight: 8,
    fontFamily: 'Poppins-Bold',
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    color: '#6c5ce7',
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  availableText: {
    color: '#00b894',
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  takenText: {
    color: '#d63031',
    fontSize: 14,
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  suggestText: {
    color: '#6c5ce7',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  continueButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  continueButtonDisabled: {
    backgroundColor: '#444',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  rulesContainer: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 16,
  },
  rulesTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  rulesText: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
});

export default UsernameScreen;
