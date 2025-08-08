# 📱 AnonChat Mobile - Структура проекта

## 🎯 Обзор

**AnonChat** - React Native приложение для анонимного чата с современной архитектурой, модульной структурой и системой реакций.

## 🏗️ Архитектура

### **Принципы:**
- ✅ **Модульность** - каждый компонент отвечает за свою часть
- ✅ **Защита от крашей** - UI Fortress Mode
- ✅ **Производительность** - оптимизированные ререндеры
- ✅ **Расширяемость** - легко добавлять новые фичи
- ✅ **Стабильность** - защищенные критические файлы

### **Технологии:**
- **React Native** + **Expo Router**
- **TypeScript** - полная типизация
- **Zustand** - управление состоянием
- **React Native Portalize** - порталы для UI
- **Android-специфика** - оптимизация под Android

## 📁 Структура проекта

```
📁 anonchat-mobile/
├── 📁 app/                          # Основной код приложения
│   ├── 📁 components/               # React компоненты
│   │   ├── 📁 reactions/           # Система реакций
│   │   │   ├── types.ts            # Типы для реакций
│   │   │   ├── ReactionBar.tsx     # Плавающая панель реакций
│   │   │   └── MessageReactions.tsx # Чипы реакций под сообщением
│   │   ├── ChatCore.tsx            # Главный компонент чата (971 строка - ЗАЩИЩЕН)
│   │   ├── ChatCoreWithReactions.tsx # Обертка с Host для порталов
│   │   ├── ChatListWithReactions.tsx # Список с интеграцией реакций
│   │   ├── ChatMessageSimple.tsx   # Упрощенный компонент сообщения
│   │   ├── ChatMessage.tsx         # Полный компонент сообщения
│   │   ├── ChatMenu.tsx            # Меню чата
│   │   ├── ChatInput.tsx           # Ввод сообщений
│   │   ├── ChatList.tsx            # Список сообщений
│   │   ├── ChatKeyboard.tsx        # Управление клавиатурой
│   │   ├── ChatSearch.tsx          # Поиск сообщений
│   │   ├── ChatTheme.tsx           # Темы оформления
│   │   ├── ThemeSelector.tsx       # Выбор темы
│   │   ├── ChatState.tsx           # Состояние чата
│   │   ├── Header.tsx              # Заголовок
│   │   ├── ReplyPreview.tsx        # Предпросмотр ответа
│   │   ├── MessageInput.tsx        # Поле ввода
│   │   ├── DevBotMessage.tsx       # Сообщения DevBot
│   │   ├── DevHUD.tsx              # HUD для DevBot
│   │   ├── UIErrorBoundary.tsx     # Обработка ошибок UI
│   │   └── ReactionPicker.tsx      # Старый пикер реакций (заменен)
│   ├── 📁 hooks/                   # React хуки
│   │   ├── useMessageStore.ts      # Zustand store для сообщений
│   │   ├── useReactions.ts         # Хук для работы с реакциями
│   │   ├── useReactionState.ts     # Управление состоянием реакций
│   │   ├── useBotProvider.ts       # Провайдер бота
│   │   ├── useDevBotCommands.ts    # Команды DevBot
│   │   ├── useKeyboardHeight.ts    # Высота клавиатуры
│   │   └── useUIWatchDog.ts        # Мониторинг UI
│   ├── 📁 screens/                 # Экраны приложения
│   │   └── ChatScreen.tsx          # Главный экран чата
│   ├── 📁 context/                 # React контексты
│   │   └── ChatLogicProvider.tsx   # Провайдер логики чата
│   ├── 📁 providers/               # Провайдеры
│   │   └── FakeSocketProvider.tsx  # Симуляция WebSocket
│   ├── 📁 utils/                   # Утилиты
│   │   ├── errorBoundary.ts        # Система обработки ошибок
│   │   ├── formatTimestamp.ts      # Форматирование времени
│   │   ├── haptics.ts              # Вибрация
│   │   └── validation.ts           # Валидация
│   ├── 📁 types/                   # TypeScript типы
│   │   └── message.ts              # Типы сообщений
│   ├── 📁 constants/               # Константы
│   │   └── themes.ts               # Темы оформления
│   ├── _layout.tsx                 # Layout для Expo Router
│   ├── +not-found.tsx              # 404 страница
│   └── index.tsx                   # Точка входа
├── 📁 docs/                        # Документация (УСТАРЕЛА)
├── 📁 scripts/                     # Скрипты автоматизации
│   ├── git-backup.ps1              # PowerShell скрипт для бэкапов
│   └── protect-chatcore.js         # Защита ChatCore
├── 📁 backups/                     # Автоматические бэкапы
├── 📁 reports/                     # Отчеты
├── 📁 assets/                      # Статические ресурсы
├── 📁 android/                     # Android настройки
├── 📁 .expo/                       # Expo конфигурация
├── 📁 .vscode/                     # Настройки VS Code
├── 📁 node_modules/                # Зависимости
├── 📁 .git/                        # Git репозиторий
├── package.json                     # Зависимости и скрипты
├── app.config.js                    # Конфигурация Expo
├── tsconfig.json                    # TypeScript конфигурация
├── eas.json                         # EAS Build конфигурация
├── .gitignore                       # Исключения Git
├── eslint.config.js                 # ESLint конфигурация
├── expo-env.d.ts                    # Expo типы
├── REACTIONS-IMPLEMENTATION.md      # Документация по реакциям
├── CHATCORE-PROTECTION.md           # Правила защиты ChatCore
├── BACKUP-README.md                 # Документация по бэкапам
├── git-backup.ps1                   # PowerShell скрипт
├── backup.log                       # Лог бэкапов
└── PROJECT-STRUCTURE.md             # Этот файл
```

## 📊 Статистика по файлам

### **Критические файлы (защищены):**
- `ChatCore.tsx` - **971 строка** (главный компонент)
- `useMessageStore.ts` - **304 строки** (Zustand store)

### **Новые модули (реакции):**
- `ReactionBar.tsx` - **106 строк**
- `MessageReactions.tsx` - **67 строк**
- `useReactions.ts` - **65 строк**
- `useReactionState.ts` - **35 строк**

### **Средние файлы:**
- `ChatList.tsx` - **379 строк**
- `ThemeSelector.tsx` - **342 строк**
- `Header.tsx` - **257 строк**
- `ChatMenu.tsx` - **241 строк**

## 🔗 Связи между компонентами

### **Основной поток:**
```
ChatScreen.tsx
    ↓
ChatCoreWithReactions.tsx (Host)
    ↓
ChatCore.tsx (защищен)
    ↓
ChatListWithReactions.tsx
    ↓
ChatMessageSimple.tsx + MessageReactions.tsx
    ↓
ReactionBar.tsx (Portal)
```

### **Store связи:**
```
useMessageStore.ts (Zustand)
    ↓
useReactions.ts (хук для реакций)
    ↓
useReactionState.ts (состояние панели)
    ↓
ReactionBar.tsx + MessageReactions.tsx
```

### **Бот система:**
```
useBotProvider.ts
    ↓
useDevBotCommands.ts
    ↓
DevBotMessage.tsx + DevHUD.tsx
```

## 🎯 Правила архитектуры

### **1. Размер файлов:**
- ✅ **200-300 строк** - идеально
- ⚠️ **400-500 строк** - допустимо, но рефакторить
- ❌ **600+ строк** - критично, обязательно разбивать

### **2. Защищенные файлы:**
- `ChatCore.tsx` - **НЕ ТРОГАТЬ** (защищен)
- `useMessageStore.ts` - только критические исправления
- `package.json` - только через npm/yarn

### **3. Новые фичи:**
- ✅ Создавать в отдельных файлах
- ✅ Максимум 300 строк на файл
- ✅ Модульная архитектура
- ✅ Типизация TypeScript

### **4. Документация:**
- ✅ Обновлять этот файл при изменениях
- ✅ Комментировать сложную логику
- ✅ Описывать API компонентов

## 🚀 Инструкции по разработке

### **Добавление новой фичи:**
1. Создать компонент в `app/components/`
2. Создать хук в `app/hooks/` (если нужен)
3. Добавить типы в `app/types/`
4. Обновить этот файл
5. Протестировать

### **Рефакторинг:**
1. Создать backup через `git-backup.ps1`
2. Разбить файл на модули по 200-300 строк
3. Обновить импорты
4. Протестировать каждую часть
5. Обновить документацию

### **Отладка:**
- Использовать `UIErrorBoundary.tsx`
- Проверять логи в консоли
- Тестировать на реальном устройстве

## 📚 Ссылки на документацию

- `REACTIONS-IMPLEMENTATION.md` - Система реакций
- `CHATCORE-PROTECTION.md` - Правила защиты
- `BACKUP-README.md` - Система бэкапов

## 🎯 Текущий статус

### **✅ Завершено:**
- ✅ Система реакций (модульная)
- ✅ Темы оформления (6 тем)
- ✅ DevBot команды
- ✅ Защита критических файлов
- ✅ Система бэкапов

### **🚧 В разработке:**
- 🔄 Тестирование реакций
- 🔄 Оптимизация производительности

### **📋 Планируется:**
- 🔮 Поиск сообщений
- 🔮 Редактирование сообщений
- 🔮 WebSocket интеграция
- 🔮 Push уведомления

---

**Последнее обновление:** Август 2025  
**Версия:** 1.0.0  
**Статус:** Активная разработка
