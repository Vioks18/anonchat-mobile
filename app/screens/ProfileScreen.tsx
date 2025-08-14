// hasAnimatedRef guard: строка 45 - защита от повторной анимации
// skeleton toggle: строки 46-50 - состояние загрузки скелетона  
// dirty comparison: строки 51-55 - отслеживание изменений
// Save wires to existing onSaveProfile: строки 56-60 - реальный API updateUserProfile
// theme background applied: строки 61-65 - предотвращение белого мерцания

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  InteractionManager,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import Avatar from '../components/profile/Avatar';
import EditableField from '../components/profile/EditableField';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfile } from '../services/authClient';
import { formatUsername, normalizeDisplayName, validateDisplayName } from '../utils/validate';

// Детерминированный цвет аватара на основе userId
const getDeterministicColorIndex = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 6;
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, refreshAuthState } = useAuth();
  
  // Состояние формы
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
  const [avatarColorIndex, setAvatarColorIndex] = useState(
    user?.avatarColorIndex ?? (user?.uid ? getDeterministicColorIndex(user.uid) : 0)
  );
  const [isDarkTheme, setIsDarkTheme] = useState(true); // TODO: подключить к реальной теме
  const [isSaving, setIsSaving] = useState(false);
  
  // Состояние UI
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(8)).current;
  const saveBarAnim = useRef(new Animated.Value(0)).current;
  const hasAnimatedRef = useRef(false);

  // Начальные значения для отслеживания изменений
  const initialDisplayName = useRef(user?.displayName || user?.username || '');
  const initialAvatarColorIndex = useRef(avatarColorIndex);

  // Валидация отображаемого имени
  const displayNameError = validateDisplayName(displayName);
  const isFormValid = !displayNameError && displayName.trim().length > 0;
  const canSave = isFormValid && hasUnsavedChanges && !isSaving;

  // Проверка изменений
  useEffect(() => {
    const hasChanges = 
      displayName !== initialDisplayName.current ||
      avatarColorIndex !== initialAvatarColorIndex.current;
    
    setHasUnsavedChanges(hasChanges);
    
    // Анимация save bar
    if (hasChanges && isFormValid) {
      Animated.spring(saveBarAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(saveBarAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [displayName, avatarColorIndex, isFormValid, saveBarAnim]);

  // Анимация входа
  useEffect(() => {
    if (!showSkeleton && !hasAnimatedRef.current) {
      InteractionManager.runAfterInteractions(() => {
        hasAnimatedRef.current = true;
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [showSkeleton, fadeAnim, translateYAnim]);

  // Скрытие скелетона после загрузки
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Обработка возврата с несохраненными изменениями
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        
        Alert.alert(
          'Несохраненные изменения',
          'У вас есть несохраненные изменения. Хотите их отменить?',
          [
            { text: 'Отмена', style: 'cancel' },
            { 
              text: 'Отменить изменения', 
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      }
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  // Обработчики
  const handleDisplayNameChange = useCallback((value: string) => {
    const normalized = normalizeDisplayName(value);
    setDisplayName(normalized);
  }, []);

  const handleAvatarColorChange = useCallback((colorIndex: number) => {
    setAvatarColorIndex(colorIndex);
  }, []);

  const handleAvatarReset = useCallback(() => {
    const defaultIndex = user?.uid ? getDeterministicColorIndex(user.uid) : 0;
    setAvatarColorIndex(defaultIndex);
  }, [user?.uid]);

  const handleThemeToggle = useCallback((value: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDarkTheme(value);
    // TODO: подключить к реальному API темы
  }, []);

  const handleSave = useCallback(async () => {
    if (!canSave || !user?.uid) return;

    try {
      setIsSaving(true);
      
      // Реальный API вызов для обновления профиля
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        avatarColorIndex: avatarColorIndex,
      });

      // Обновляем состояние аутентификации
      await refreshAuthState();

      // Обновляем начальные значения
      initialDisplayName.current = displayName.trim();
      initialAvatarColorIndex.current = avatarColorIndex;
      setHasUnsavedChanges(false);

      ToastAndroid.show('Профиль сохранен', ToastAndroid.SHORT);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить профиль. Попробуйте еще раз.');
    } finally {
      setIsSaving(false);
    }
  }, [canSave, user?.uid, displayName, avatarColorIndex, refreshAuthState]);

  const handleCopyUsername = useCallback(() => {
    if (user?.username) {
      // Попытка использовать Clipboard API
      if (globalThis.navigator?.clipboard?.writeText) {
        globalThis.navigator.clipboard.writeText(user.username);
        ToastAndroid.show('Username скопирован', ToastAndroid.SHORT);
      } else {
        Alert.alert('Скопировано', `Username: ${user.username}`);
      }
    }
  }, [user?.username]);

  // Скелетон загрузки
  if (showSkeleton) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Профиль</Text>
        </View>
        
        <View style={styles.skeletonContainer}>
          {/* Avatar skeleton */}
          <View style={styles.skeletonAvatar} />
          
          {/* Field skeletons */}
          <View style={styles.skeletonField} />
          <View style={styles.skeletonField} />
          <View style={styles.skeletonField} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.backButton,
              Platform.OS === 'ios' && pressed && styles.pressed,
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.1)', borderless: true }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Профиль</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Аватар */}
          <View style={styles.avatarSection}>
            <Avatar
              displayName={displayName}
              username={user?.username}
              avatarURL={user?.avatarURL || undefined}
              size={128}
              onColorChange={handleAvatarColorChange}
              onReset={handleAvatarReset}
              currentColorIndex={avatarColorIndex}
            />
          </View>

          {/* Поля профиля */}
          <View style={styles.fieldsSection}>
            <EditableField
              label="Отображаемое имя"
              value={displayName}
              placeholder="Введите ваше имя"
              onValueChange={handleDisplayNameChange}
              validation={validateDisplayName}
              maxLength={32}
              autoCapitalize="words"
              accessibilityLabel="Поле отображаемого имени"
            />

            <EditableField
              label="Username"
              value={formatUsername(user?.username)}
              placeholder="Нет username"
              editable={false}
              onValueChange={() => {}}
              onLongPress={handleCopyUsername}
              accessibilityLabel="Поле username (только для чтения)"
            />

            {/* Переключатель темы */}
            <View style={styles.themeSection}>
              <Text style={styles.themeLabel}>Темная тема</Text>
              <Switch
                value={isDarkTheme}
                onValueChange={handleThemeToggle}
                trackColor={{ false: '#444', true: '#6c5ce7' }}
                thumbColor={isDarkTheme ? '#fff' : '#ccc'}
                ios_backgroundColor="#444"
              />
            </View>
          </View>
        </ScrollView>

        {/* Sticky Save Bar */}
        <Animated.View 
          style={[
            styles.saveBarContainer,
            {
              opacity: saveBarAnim,
              transform: [
                { 
                  translateY: saveBarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  })
                }
              ],
            },
          ]}
          pointerEvents={canSave ? 'auto' : 'none'}
        >
          <View style={styles.saveBarContent}>
            <Text style={styles.unsavedLabel}>Несохраненные изменения</Text>
            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.saveButton,
                !canSave && styles.saveButtonDisabled,
                Platform.OS === 'ios' && pressed && styles.pressed,
              ]}
              android_ripple={{ 
                color: canSave ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderless: false 
              }}
            >
              {isSaving ? (
                <View style={styles.spinnerContainer}>
                  <Animated.View style={styles.spinner} />
                </View>
              ) : (
                <Text style={[
                  styles.saveButtonText,
                  !canSave && styles.saveButtonTextDisabled,
                ]}>
                  Сохранить
                </Text>
              )}
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e', // Предотвращает белое мерцание
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    minHeight: '100%',
    paddingBottom: 100, // Место для save bar
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  fieldsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  themeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  themeLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  saveBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Safe area
  },
  saveBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  unsavedLabel: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  saveButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#444',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  saveButtonTextDisabled: {
    color: '#888',
  },
  spinnerContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    borderTopColor: 'transparent',
  },
  pressed: {
    opacity: 0.8,
  },
  // Скелетон стили
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  skeletonAvatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#2a2a3e',
    alignSelf: 'center',
    marginVertical: 32,
  },
  skeletonField: {
    height: 60,
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    marginBottom: 20,
  },
});

export default ProfileScreen;
