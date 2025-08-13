# Firebase Email Link Authentication Setup

## Обзор
AnonChat поддерживает passwordless sign-in через Email Link используя Firebase Auth. Пользователи получают ссылку на email и могут войти без пароля.

## Настройка Firebase Console

### 1. Authentication → Sign-in method
- ✅ **Enable Email/Password** (требуется для Email Link)
- ✅ **Enable Email link (passwordless)**

### 2. Authorized domains
Убедитесь, что оба домена присутствуют в списке:
- `anonchat-axora.web.app` (предпочтительный)
- `anonchat-axora.firebaseapp.com` (fallback)

### 3. Android App Configuration
- **Package name**: `com.axora.anonchat`
- **SHA-256 fingerprint**: должен быть добавлен в Firebase Console
- **Google Services**: `google-services.json` должен быть в корне проекта

## Технические детали

### Домен и путь
- **Primary Hosting domain**: `anonchat-axora.web.app` (предпочтительный)
- **Fallback Hosting domain**: `anonchat-axora.firebaseapp.com`
- **Link path**: `/auth/links`
- **Full URL**: `https://anonchat-axora.web.app/auth/links`

### App Links Configuration
Android intent filter настроен для автоматического открытия приложения при переходе по ссылке:
```json
{
  "action": "VIEW",
  "category": ["BROWSABLE", "DEFAULT"],
  "data": [
    {
      "scheme": "https",
      "host": "anonchat-axora.web.app",
      "pathPrefix": "/auth/links"
    },
    {
      "scheme": "https",
      "host": "anonchat-axora.firebaseapp.com",
      "pathPrefix": "/auth/links"
    }
  ]
}
```

### Схема приложения
- **Custom scheme**: `anonchat://`
- **Linking prefixes**: 
  - `anonchat://`
  - `https://anonchat-axora.firebaseapp.com`

## Тестирование

### Ручные тесты
1. **Запуск Dev Client** → показывается Email Link экран
2. **Ввод email** → нажатие "Отправить ссылку" → успешное уведомление
3. **Открытие email на том же устройстве** → нажатие на ссылку → приложение открывается → автоматический sign-in → переход к ChatList
4. **Открытие email на другом устройстве** → приложение запрашивает повторный ввод email → завершение sign-in
5. **Перезапуск приложения** → пользователь остается в системе
6. **Выход** → возврат к Auth экрану

### Ожидаемое поведение
- Ссылки отправляются на указанный email
- При переходе по ссылке приложение автоматически открывается
- Sign-in завершается без дополнительных действий
- Состояние аутентификации сохраняется между сессиями

## Безопасность
- App Check отключен для Dev Client совместимости
- Email Link имеет ограниченное время действия
- Ссылки привязаны к конкретному устройству через SecureStore
- При открытии на другом устройстве требуется повторный ввод email

## Troubleshooting

### Проблемы с AsyncStorage
Если вы видите ошибку `[@RNC/AsyncStorage]: NativeModule: AsyncStorage is null`:

1. **Перезапустите Metro bundler с очисткой кэша:**
   ```bash
   npx expo start --clear
   ```

2. **Пересоберите приложение:**
   ```bash
   npx expo run:android --clear
   ```

3. **Переустановите зависимости:**
   ```bash
   npm install
   # или
   rm -rf node_modules && npm install
   ```

4. **Используется SecureStore:**
     Приложение использует `expo-secure-store` вместо AsyncStorage для более надежной работы в React Native:
     ```bash
     # SecureStore уже установлен
     npx expo install expo-secure-store
     ```

### Проблемы с NavigationContainer
Если вы видите ошибку `Looks like you have nested a 'NavigationContainer' inside another`:

1. **Проблема решена**: Убран вложенный NavigationContainer из RootNavigator
2. **Expo Router** автоматически создает NavigationContainer
3. **React Navigation** используется только для навигации между экранами

### Проблемы с Firebase Auth persistence
Если вы видите предупреждение о том, что Firebase Auth не использует AsyncStorage:

1. **Проблема решена**: Используется SecureStore для persistence
2. **Email Link** сохраняет данные через SecureStore
3. **Firebase Auth** будет использовать SecureStore через настройки в emailLink.ts

### Проблемы с App Links
1. Проверьте SHA-256 fingerprint в Firebase Console
2. Убедитесь, что `google-services.json` актуален
3. Проверьте intent filter в `app.config.js`

### Проблемы с Email
1. Проверьте настройки Email/Password в Firebase Console
2. Убедитесь, что домен добавлен в authorized domains
3. Проверьте логи Firebase для ошибок отправки

### Проблемы с Deep Links
1. Проверьте схему приложения в `app.config.js`
2. Убедитесь, что linking prefixes настроены правильно
3. Проверьте intent filter для Android
