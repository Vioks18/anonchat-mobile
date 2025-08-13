# Firebase Setup для AnonChat MVP

## 🔥 Настройка Firebase

### 1. Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Создайте новый проект: `anonchat-mvp`
3. Включите Authentication → Anonymous auth
4. Создайте Firestore Database в режиме test

### 2. Получение конфигурации

1. В настройках проекта → General → Your apps
2. Добавьте Web app: `anonchat-web`
3. Скопируйте конфигурацию:

```javascript
const firebaseConfig = {
  apiKey: "ваш-api-key",
  authDomain: "anonchat-mvp.firebaseapp.com",
  projectId: "anonchat-mvp",
  storageBucket: "anonchat-mvp.appspot.com",
  messagingSenderId: "ваш-sender-id",
  appId: "ваш-app-id"
};
```

### 3. Обновление конфигурации

Замените конфигурацию в `app/services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "ваш-реальный-api-key",
  authDomain: "ваш-проект.firebaseapp.com",
  projectId: "ваш-проект-id",
  storageBucket: "ваш-проект.appspot.com",
  messagingSenderId: "ваш-sender-id",
  appId: "ваш-app-id"
};
```

### 4. Правила Firestore

Установите следующие правила в Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать/писать свои данные
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Чат доступен участникам
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
    }
    
    // Сообщения доступны участникам чата
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.members;
    }
    
    // UserChats доступны владельцу
    match /userChats/{userId}/items/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

## 🚀 Запуск

### Установка зависимостей
```bash
npm install
```

### Запуск на двух устройствах для тестирования

1. **Устройство 1:**
```bash
npm start
# Сканируйте QR код или запустите на эмуляторе
```

2. **Устройство 2:**
```bash
npm start
# Сканируйте QR код или запустите на другом эмуляторе
```

### Тестирование

1. **Создание чата:**
   - На устройстве 1: нажмите + → введите UID устройства 2
   - На устройстве 2: нажмите + → введите UID устройства 1

2. **Отправка сообщений:**
   - Отправьте сообщение на одном устройстве
   - Проверьте получение на другом

3. **Удаление сообщений:**
   - Долгое нажатие на сообщение → "Delete for me" / "Delete for all"

## 🔧 Отладка

### Логи Firebase
```bash
# В консоли браузера или React Native Debugger
console.log('Firebase config:', firebaseConfig);
```

### Эмуляторы Firebase (опционально)
```bash
# Установка Firebase CLI
npm install -g firebase-tools

# Запуск эмуляторов
firebase emulators:start
```

## 📱 Структура данных

### Collections

- **users/{uid}** - данные пользователей
- **chats/{chatId}** - информация о чатах
- **chats/{chatId}/messages/{messageId}** - сообщения
- **userChats/{uid}/items/{chatId}** - непрочитанные сообщения

### Индексы (автоматически создаются)

Firestore автоматически создаст необходимые индексы при первом запросе.

## ⚠️ Важные замечания

1. **Безопасность:** Это MVP версия с базовыми правилами безопасности
2. **Масштабирование:** Для продакшена добавьте индексы и оптимизируйте запросы
3. **Офлайн:** Firestore поддерживает офлайн режим по умолчанию
4. **Лимиты:** Бесплатный план: 50k чтений/день, 20k записей/день
