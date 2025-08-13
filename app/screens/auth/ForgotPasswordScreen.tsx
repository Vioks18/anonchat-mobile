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
import { sendResetEmail } from '../../services/authApi';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите email');
      return;
    }

    setLoading(true);
    try {
      await sendResetEmail(email.trim());
             Alert.alert(
         'Успех', 
         'Ссылка для сброса пароля отправлена на ваш email',
         [{ text: 'OK', onPress: () => navigation.goBack() }]
       );
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
          <Text style={styles.title}>Восстановить пароль</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            Введите email, указанный при регистрации. Мы отправим вам ссылку для сброса пароля.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendResetEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Отправить ссылку</Text>
            )}
          </TouchableOpacity>

                     <TouchableOpacity
             style={styles.linkButton}
             onPress={() => navigation.goBack()}
             disabled={loading}
           >
            <Text style={styles.linkText}>Вернуться к входу</Text>
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  description: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
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

export default ForgotPasswordScreen;
