# Username Uniqueness System

## Overview

Система обеспечивает строгую уникальность username через серверное резервирование и подтверждение. Клиенты не могут напрямую записывать в коллекцию `usernames` - все операции выполняются через Cloud Functions.

## Architecture

### Firestore Collections

#### `usernames/{usernameLower}`
- `uid?: string` - UID пользователя (только для подтвержденных)
- `status: "reserved" | "confirmed"` - статус username
- `createdAt: Timestamp` - время создания записи
- `expiresAt?: Timestamp` - время истечения резервации (30 минут)
- `reservedByDeviceId?: string` - ID устройства, зарезервировавшего username
- `reservedByEmail?: string` - email (опционально)
- `normalized: string` - нормализованный username (равен docId)

#### `users/{uid}`
- `uid: string` - UID пользователя
- `email: string` - email пользователя
- `usernameLower: string` - подтвержденный username (должен соответствовать правилам)
- `createdAt: Timestamp` - время создания аккаунта
- `avatarURL?: string` - URL аватара

### Cloud Functions

#### `reserveUsername({ username, deviceId, email? })`
- Нормализует и валидирует username
- В транзакции проверяет доступность
- Создает резервацию на 30 минут
- Возвращает `{ ok: true, usernameLower, expiresAt }`

#### `confirmUsername({ username, uid })`
- Подтверждает резервацию после создания Firebase Auth пользователя
- Меняет статус с "reserved" на "confirmed"
- Удаляет `expiresAt` для подтвержденных username

#### `releaseUsername({ username, deviceId })`
- Освобождает резервацию (устанавливает `expiresAt = now`)
- Работает только для собственных резерваций устройства

#### `cleanupExpiredReservations()`
- Запускается каждые 10 минут
- Удаляет истекшие резервации

## Registration Flow

1. **Username Input** → `reserveUsername()` → переходит к email/password
2. **Create Account** → `createUserWithEmailAndPassword()` → `confirmUsername()` → создание профиля
3. **Cancel** → `releaseUsername()` (опционально)

## Security Rules

- Клиенты НЕ могут записывать в `/usernames/*`
- `/users/{uid}` можно создать/обновить только если:
  - `request.auth.uid == uid`
  - `usernameLower` соответствует правилам
  - Существует подтвержденная запись в `usernames/{usernameLower}`

## Edge Cases

### Race Conditions
- Два клиента пытаются зарезервировать один username
- Только одна транзакция успешна, второй получает "USERNAME_TAKEN"

### Abandoned Reservations
- Автоматически истекают через 30 минут
- Очищаются каждые 10 минут

### Retry Logic
- Тот же `deviceId` может повторить попытку в рамках резервации
- Разные устройства получают "USERNAME_TAKEN"

### Failed Registration
- Если `confirmUsername()` не удался → удаляется Firebase Auth пользователь
- Резервация освобождается автоматически

## Reserved Words

Следующие username заблокированы:
- `admin`, `support`, `system`, `api`
- `null`, `me`, `you`, `test`, `demo`
- `info`, `help`, `contact`, `about`
- `terms`, `privacy`, `settings`
- `login`, `logout`, `register`, `signup`
- `signin`, `auth`, `user`, `anonymous`
- `guest`, `bot`, `robot`, `auto`
- `service`, `official`

## Validation Rules

- Длина: 3-20 символов
- Символы: только `a-z`, `0-9`, `_`
- Нормализация: trim, toLowerCase, collapse underscores
- Не может быть зарезервированным словом

## Deployment

```bash
# Deploy functions
cd functions && npm install && npm run build
firebase deploy --only functions

# Deploy rules
firebase deploy --only firestore:rules

# Enable TTL (manual step in Firebase Console)
# Collection: usernames, Field: expiresAt, TTL: 30 minutes
```

## Migration

Для существующих пользователей нужно выполнить миграцию:

```javascript
// One-time migration script
const users = await db.collection('users').get();
const batch = db.batch();

users.docs.forEach(doc => {
  const userData = doc.data();
  if (userData.username) {
    const usernameLower = userData.username.toLowerCase();
    const usernameRef = db.collection('usernames').doc(usernameLower);
    batch.set(usernameRef, {
      uid: doc.id,
      status: 'confirmed',
      createdAt: userData.createdAt || admin.firestore.Timestamp.now(),
      normalized: usernameLower
    });
  }
});

await batch.commit();
```
