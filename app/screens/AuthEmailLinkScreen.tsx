import { Ionicons } from '@expo/vector-icons';
import { getAuth, signInWithEmailLink } from 'firebase/auth';
import React, { useState } from 'react';
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
import { sendMagicLink, tryCompleteEmailLinkSignIn } from '../auth/emailLink';
import CustomAlert from '../components/ui/CustomAlert';
import { toast } from '../components/ui/Toast';

const AuthEmailLinkScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');
  const [errorAlert, setErrorAlert] = useState<{ visible: boolean; message?: string }>({ visible: false });

  const handleSendLink = async () => {
    if (!email.trim()) {
      setErrorAlert({ visible: true, message: 'Пожалуйста, введите email' });
      return;
    }

    setLoading(true);
    try {
      const result = await sendMagicLink(email.trim());
      if (result.ok) {
        toast.show({
          type: 'success',
          title: 'Успех',
          message: 'Ссылка для входа отправлена на ваш email. Проверьте почту и нажмите на ссылку.',
        });
      } else {
        const message = result.error instanceof Error ? result.error.message : 'Произошла ошибка';
        setErrorAlert({ visible: true, message });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка';
      setErrorAlert({ visible: true, message });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSignIn = async () => {
    if (!email.trim() || !pendingUrl) {
      setErrorAlert({ visible: true, message: 'Пожалуйста, введите email' });
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      await signInWithEmailLink(auth, email.trim(), pendingUrl);
      toast.show({
        type: 'success',
        title: 'Успех',
        message: 'Вход выполнен успешно!',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка';
      setErrorAlert({ visible: true, message });
    } finally {
      setLoading(false);
    }
  };

  // Check if we need to complete sign-in on mount
  React.useEffect(() => {
    const checkPendingSignIn = async () => {
      const res = await tryCompleteEmailLinkSignIn();
      if (res.needsEmail) {
        setNeedsEmail(true);
        setPendingUrl(res.url);
      }
    };
    checkPendingSignIn();
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="mail-outline" size={64} color="#6c5ce7" />
          <Text style={styles.title}>
            {needsEmail ? 'Завершить вход' : 'Войти по ссылке'}
          </Text>
          <Text style={styles.subtitle}>
            {needsEmail 
              ? 'Введите email для завершения входа'
              : 'Введите email для получения ссылки для входа'
            }
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите ваш email"
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
            onPress={needsEmail ? handleCompleteSignIn : handleSendLink}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {needsEmail ? 'Завершить вход' : 'Отправить ссылку'}
              </Text>
            )}
          </TouchableOpacity>

          {needsEmail && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => {
                setNeedsEmail(false);
                setPendingUrl('');
              }}
              disabled={loading}
            >
              <Text style={styles.linkText}>Отправить новую ссылку</Text>
            </TouchableOpacity>
          )}
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
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
  },
  form: {
    paddingHorizontal: 20,
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

export default AuthEmailLinkScreen;
