# Аутентификация в AnonChat

## Обзор

Система аутентификации поддерживает:
- Регистрация с Email/Password + уникальный @username
- Вход с Email/Password
- Восстановление пароля
- Привязка анонимного пользователя к Email/Password (сохранение истории)

## Архитектура

### Data Model

#### users/{uid}
```typescript
{
  uid: string,
  email: string,
  username: "@handle",        // lowercase, unique
  displayName?: string,
  avatarURL?: string,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

#### usernames/{handle}
```typescript
{
  uid: string                 // handle = docId, lowercase (no '@')
}
```

### API Functions

#### authApi.ts
- `registerWithEmail(data)` - создание нового пользователя
- `linkAnonToEmail(data)` - привязка анонимного пользователя
- `loginWithEmail(data)` - вход в систему
- `sendResetEmail(email)` - отправка ссылки для сброса
- `logout()` - выход из системы
- `checkUsernameAvailable(handle)` - проверка доступности username
- `reserveUsernameTx(handle, uid)` - атомарное резервирование username

## Потоки аутентификации

### 1. Регистрация нового пользователя

```
1. Пользователь вводит email, password, username
2. Валидация username (формат, длина, зарезервированные имена)
3. Проверка доступности username в Firestore
4. createUserWithEmailAndPassword() в Firebase Auth
5. reserveUsernameTx() - атомарная транзакция:
   - Проверка существования usernames/{handle}
   - Создание usernames/{handle} с {uid}
   - Обновление users/{uid} с username
6. Создание users/{uid} документа
7. Rollback: удаление Firebase Auth пользователя при ошибке
```

### 2. Привязка анонимного пользователя

```
1. Проверка: текущий пользователь анонимный
2. Валидация и проверка доступности username
3. linkWithCredential() - привязка к Email/Password
4. reserveUsernameTx() - резервирование username
5. Обновление users/{uid} с email и username
```

### 3. Вход в систему

```
1. signInWithEmailAndPassword() в Firebase Auth
2. mapFirebaseUser() - получение данных из users/{uid}
3. Возврат User объекта с полными данными
```

### 4. Восстановление пароля

```
1. sendPasswordResetEmail() в Firebase Auth
2. Firebase отправляет email со ссылкой
3. Пользователь переходит по ссылке и устанавливает новый пароль
```

## Уникальность Username

### Валидация
- Формат: `/^[a-z0-9][a-z0-9_]{2,19}$/`
- Длина: 3-20 символов
- Зарезервированные имена: admin, support, help, etc.
- Case-insensitive (все в lowercase)

### Атомарность
```typescript
// Firestore Transaction
await runTransaction(db, async (transaction) => {
  const usernameRef = doc(db, 'usernames', handle);
  const usernameDoc = await transaction.get(usernameRef);
  
  if (usernameDoc.exists()) {
    throw new Error('Username already taken');
  }
  
  transaction.set(usernameRef, { uid });
  transaction.set(userRef, { username: `@${handle}` }, { merge: true });
});
```

## Безопасность

### Development Rules
- App Check отключен для совместимости с Dev Client
- Публичное чтение usernames для проверки доступности
- Базовая проверка аутентификации

### Production Considerations
- Включить App Check (Play Integrity)
- Строгие правила доступа
- Rate limiting для username проверок
- Валидация на сервере

## Навигация

### AuthNavigator
- Login → Register → ForgotPassword
- Stack навигация с кастомными заголовками

### RootNavigator
- Если `initializing` → Loading screen
- Если `user` → AppNavigator (ChatList/Chat)
- Если `!user` → AuthNavigator

## Обработка ошибок

### Firebase Auth Errors
- `auth/user-not-found` → "Пользователь не найден"
- `auth/wrong-password` → "Неверный пароль"
- `auth/email-already-in-use` → "Email уже используется"
- `auth/weak-password` → "Пароль слишком слабый"

### Username Errors
- `Username already taken` → "Username уже занят"
- `Invalid username` → "Неверный формат username"
- `Reserved username` → "Username зарезервирован"

## Тестирование

### Manual Tests
1. Регистрация нового пользователя
2. Вход с правильными/неправильными данными
3. Восстановление пароля
4. Привязка анонимного пользователя
5. Проверка уникальности username (два устройства)

### Automated Tests
- Валидация username
- Проверка доступности
- Атомарность транзакций
- Обработка ошибок

## TODO

- [ ] Включить App Check для production
- [ ] Добавить rate limiting
- [ ] Серверная валидация
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Social login (Google, Apple)
