# 🤖 Боты в AnonChat

## 📋 Обзор

В приложении есть два типа ботов:

1. **useBotProvider** - бот с случайными сообщениями
2. **useDevBotCommands** - бот с командами разработчика

## 🚫 Статус: ОТКЛЮЧЕНЫ ДЛЯ ПРОДАКШЕНА

Оба бота отключены по умолчанию для продакшена.

---

## 🤖 1. useBotProvider (Бот с сообщениями)

### Что делает:
- Отправляет случайные сообщения каждые 5-15 секунд
- Сообщения типа: "Привет! Я бот Axora 🤖", "Как дела?", "Нравится чат?"

### Где находится:
- `app/hooks/useBotProvider.ts`
- Используется в `app/screens/ChatScreen.tsx`

### Как включить для разработки:

**Вариант 1: Временно в коде**
```typescript
// В app/hooks/useBotProvider.ts
const [isBotEnabled, setIsBotEnabled] = useState(true); // Включить
```

**Вариант 2: Через переменную окружения**
```typescript
// В app/hooks/useBotProvider.ts
const [isBotEnabled, setIsBotEnabled] = useState(__DEV__ && process.env.EXPO_PUBLIC_ENABLE_BOT === 'true');
```

### Как активировать:
- Добавить кнопку в UI для `toggleBot()`
- Или включить по умолчанию в dev режиме

---

## 🛠️ 2. useDevBotCommands (Команды разработчика)

### Что делает:
- Обрабатывает команды типа `/help`, `/status`, `/ping`
- Показывает системную информацию
- Отладочные функции

### Доступные команды:
- `/help` - показать справку
- `/status` - информация о системе
- `/debug` - переключить debug режим
- `/ping` - проверить работоспособность
- `/scroll` - прокрутка к концу чата

### Где находится:
- `app/hooks/useDevBotCommands.ts`
- Используется в `app/screens/ChatScreen.tsx`

### Как включить для разработки:

**Вариант 1: Раскомментировать в ChatScreen.tsx**
```typescript
// В app/screens/ChatScreen.tsx
import { useDevBotCommands } from '../hooks/useDevBotCommands';

// Раскомментировать:
const { handleCommand, setFlatListRef } = useDevBotCommands();

// И в handleSendMessage:
if (text.startsWith('/')) {
  const isCommand = handleCommand(text);
  if (isCommand) {
    return; // Команда обработана
  }
}
```

**Вариант 2: Через переменную окружения**
```typescript
// В app/screens/ChatScreen.tsx
const { handleCommand, setFlatListRef } = __DEV__ ? useDevBotCommands() : { handleCommand: () => false, setFlatListRef: () => {} };
```

---

## 🔧 Быстрое включение для разработки

### Включить оба бота:
```bash
# 1. Отредактировать app/hooks/useBotProvider.ts
# Изменить строку 29:
const [isBotEnabled, setIsBotEnabled] = useState(__DEV__); // Включить в dev режиме

# 2. Отредактировать app/screens/ChatScreen.tsx
# Раскомментировать строки:
import { useDevBotCommands } from '../hooks/useDevBotCommands';
const { handleCommand, setFlatListRef } = useDevBotCommands();

# И в handleSendMessage раскомментировать проверку команд
```

### Включить только useBotProvider:
```typescript
// В app/hooks/useBotProvider.ts
const [isBotEnabled, setIsBotEnabled] = useState(__DEV__);
```

### Включить только useDevBotCommands:
```typescript
// В app/screens/ChatScreen.tsx раскомментировать импорт и использование
```

---

## 🚨 Важно для продакшена

1. **useBotProvider** отключен по умолчанию
2. **useDevBotCommands** полностью закомментирован
3. Команды `/help`, `/status` и т.д. не работают
4. Случайные сообщения от бота не отправляются

---

## 🧪 Тестирование

После включения ботов:

1. **useBotProvider**: Бот будет отправлять сообщения каждые 5-15 секунд
2. **useDevBotCommands**: Команды `/help`, `/status`, `/ping` будут работать

### Примеры команд:
```
/help
/status
/ping
/debug
/scroll
```

---

## 📝 Примечания

- Боты предназначены только для разработки и тестирования
- В продакшене они должны быть отключены
- Можно легко включить/выключить через переменные окружения
- Код закомментирован, а не удален, для быстрого восстановления
