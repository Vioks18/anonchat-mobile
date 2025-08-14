# AnonChat Mobile

React Native приложение для анонимного общения с поддержкой AI ассистента.

## 🚀 Быстрый старт

1. Установите зависимости:
```bash
npm install
```

2. Настройте AI (опционально):
   - Создайте файл `.env` в корне проекта
   - Добавьте ваш Gemini API ключ: `GEMINI_API_KEY=your_api_key_here`
   - Ключ должен быть ограничен для Android приложения (package + SHA)

3. Запустите приложение:
```bash
npm start
```

4. Откройте в Expo Dev Client на Android устройстве

## 🤖 AI Ассистент

Приложение поддерживает интеграцию с Google Gemini AI:

- **Кнопка AI**: Появляется рядом с кнопкой отправки при настроенном API ключе
- **Контекст**: AI получает последние 15 сообщений для понимания контекста
- **Безопасность**: API ключ ограничен для Android приложения
- **Fallback**: Если AI не настроен, показывается предупреждающий баннер

### Настройка API ключа

1. Получите API ключ в [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Ограничьте ключ для Android приложения:
   - Application restrictions: Android apps
   - Package name: `com.axora.anonchat`
   - SHA-256: ваш отпечаток подписи
   - API restrictions: Generative Language API
3. Добавьте ключ в `.env` файл

## 📱 Функции

- Анонимное общение
- Реакции на сообщения
- Темы оформления
- Поиск по сообщениям
- AI ассистент (при настройке)
- Поддержка DevBot команд

## 🔧 Разработка

- React Native + Expo Dev Client
- TypeScript
- Firebase (Auth, Firestore)
- Zustand для состояния
- Google Gemini AI API

## 📄 Лицензия

MIT
