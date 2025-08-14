# Клиентская аутентификация с Firestore

## Обзор

Система аутентификации полностью работает на клиенте с использованием Firestore для хранения профилей пользователей и обеспечения уникальности username.

## Архитектура

### Firestore Collections

#### `usernames/{username}`
- `uid: string` - UID пользователя
- `createdAt: Timestamp` - время создания

#### `users/{uid}`
- `uid: string` - UID пользователя
- `email: string` - email пользователя
- `username: string` - подтвержденный username
- `createdAt: Timestamp` - время создания аккаунта
- `avatarURL?: string` - URL аватара

### Основные функции

#### `signUpWithEmail(data: SignUpData)`
1. **Валидация** - проверка формата username и зарезервированных слов
2. **Проверка доступности** - `isUsernameAvailable()`
3. **Создание Auth пользователя** - `createUserWithEmailAndPassword`
4. **Создание документов** - `usernames/{username}` и `users/{uid}`
5. **Rollback** - удаление Auth пользователя при ошибке

#### `isUsernameAvailable(username: string)`
- Проверка доступности username (только чтение)
- Валидация формата
- Возвращает `boolean`

#### `getUserProfile(uid: string)`
- Загрузка профиля пользователя из Firestore
- Используется в `useAuth` hook

## Безопасность

### Firestore Rules

#### Коллекция `usernames`
```firestore
allow create: if 
  request.auth != null &&
  request.resource.data.uid == request.auth.uid &&
  username.matches('^[a-z0-9_]{3,20}$');
```

#### Коллекция `users`
```firestore
allow create, update: if 
  request.auth != null && 
  request.auth.uid == uid &&
  request.resource.data.username is string &&
  request.resource.data.username.matches('^[a-z0-9_]{3,20}$');
```

### Защита от гонки

- **Проверка перед созданием** - username проверяется до создания Auth пользователя
- **Rollback** - Auth пользователь удаляется при ошибке
- **Firestore constraints** - правила безопасности предотвращают дублирование

## Валидация

### Username правила
- Длина: 3-20 символов
- Символы: только `a-z`, `0-9`, `_`
- Нормализация: trim, toLowerCase, collapse underscores
- **Гибридная система @**: пользователь может вводить с @ или без, система автоматически нормализует
- Зарезервированные слова: `admin`, `support`, `system`, etc.

### Примеры ввода username:
- `testuser` → сохраняется как `testuser` → отображается как `@testuser`
- `@testuser` → сохраняется как `testuser` → отображается как `@testuser`
- `TestUser` → сохраняется как `testuser` → отображается как `@testuser`

### Email правила
- Стандартная валидация email
- Проверка через Firebase Auth

### Password правила
- Минимум 6 символов
- Проверка через Firebase Auth

## Поток регистрации

1. **Ввод данных** → валидация на клиенте
2. **Проверка username** → `isUsernameAvailable()`
3. **Создание Auth пользователя** → `createUserWithEmailAndPassword()`
4. **Создание документов**:
   - `usernames/{username}` с uid
   - `users/{uid}` с полным профилем
5. **Обработка результата**:
   - Успех → переход в приложение
   - Ошибка → удаление Auth пользователя, показ ошибки

## Поток аутентификации

1. **Вход** → `signInWithEmailAndPassword()`
2. **Загрузка профиля** → `getUserProfile(uid)` из Firestore
3. **Обновление состояния** → `useAuth` hook

## Преимущества

### ✅ Безопасность
- Правила безопасности на уровне базы данных
- Rollback при ошибках
- Валидация на клиенте и сервере

### ✅ Производительность
- Минимальное количество запросов
- Кэширование Firestore
- Простая логика

### ✅ Стоимость
- Работает на бесплатном плане Firebase
- Нет платы за Cloud Functions
- Только стандартные Firestore операции

### ✅ Простота
- Вся логика в одном месте
- Легко отлаживать
- Простое тестирование

## Ограничения

### ⚠️ Безопасность
- Валидация на клиенте (дополнительно защищена правилами)
- Нет серверной логики

### ⚠️ Масштабируемость
- Ограничения Firestore
- Нет сложной бизнес-логики

## Тестирование

### Успешная регистрация
1. Ввести валидный username
2. Ввести email и пароль
3. Нажать "Создать аккаунт"
4. Проверить создание документов в Firestore

### Проверка уникальности
1. Зарегистрировать пользователя с username
2. Попробовать зарегистрировать второго с тем же username
3. Должна появиться ошибка "Username уже занят"

### Проверка валидации
1. Попробовать зарезервированные слова
2. Попробовать недопустимые символы
3. Проверить ограничения длины

## Мониторинг

### Firestore Console
- Проверить коллекцию `usernames` для зарегистрированных username
- Проверить коллекцию `users` для профилей пользователей

### Логи
- Консоль приложения для ошибок валидации
- Firebase Console для ошибок Firestore
- Firebase Auth Console для ошибок аутентификации

## Будущие улучшения

### Обновление username
- Функция `updateUserProfile()` готова для использования
- Потребуется дополнительная логика для изменения username

### Дополнительные методы аутентификации
- Google Sign-in
- Phone authentication
- Анонимная аутентификация
