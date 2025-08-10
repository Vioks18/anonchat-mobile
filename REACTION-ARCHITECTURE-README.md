# Новая архитектура реакций AnonChat

## Обзор

Система реакций реализована как модульная архитектура с использованием порталов для оверлеев, без модальных окон.

## Архитектура

### Основные компоненты

- **`useReactionState.ts`** - управление состоянием панели реакций
- **`MessageWithReactions.tsx`** - обертка сообщения с реакциями
- **`ChatListWithReactions.tsx`** - список сообщений с поддержкой реакций
- **`ReactionBar.tsx`** - плавающая панель с эмодзи
- **`MessageReactions.tsx`** - отображение реакций под сообщением
- **`ActionsBar.tsx`** - заглушка для будущих действий

### Типы

```typescript
export type ReactionAnchor = { x: number; y: number; w: number; h: number };
export type EmojiType = '👍' | '❤️' | '😂' | '😮' | '😢' | '😡';
export type ActionItem = { key: 'reply'|'copy'|'delete'|'share'|'pin'; icon: ReactNode; onPress: () => void; visible?: boolean; };
```

## API

### useReactionState

```typescript
const { selectedMessageId, anchor, visible, openAtMessage, close } = useReactionState();
```

- `openAtMessage(messageId, ref)` - открывает панель у сообщения
- `close()` - закрывает панель
- Автоматическое закрытие по клавиатуре

### MessageWithReactions

```typescript
<MessageWithReactions
  message={message}
  isMyMessage={isMyMessage}
  isSelected={isSelected}
  onLongPress={() => handleLongPress(item.id)}
  onPress={() => handleMessagePress(item.id)}
  registerRef={registerMessageRef}
/>
```

### ChatListWithReactions

```typescript
<ChatListWithReactions
  messages={messages}
  onScrollBeginDrag={handleScrollBeginDrag}
/>
```

## Последние изменения (2025-01-09)

### ✅ Исправленные проблемы

1. **Единый путь открытия** - long-press и double-tap теперь используют одинаковый `openAtMessage(messageId, ref)`
2. **Закрытие по клавиатуре** - добавлены слушатели `keyboardDidShow` и `keyboardWillShow`
3. **Правильное позиционирование** - исправлен баг с панелью "вверху" при double-tap
4. **Подготовка ActionsBar** - добавлена заглушка для будущего меню действий

### 🔧 Технические детали

#### useReactionState.ts
- Добавлен тип `ReactionAnchor`
- Единая функция `openAtMessage` с `measureInWindowAsync`
- Автоматическое закрытие по клавиатуре
- Валидация anchor перед открытием

#### MessageWithReactions.tsx
- Добавлен `registerRef` для регистрации ref родителю
- Корневой ref для точного измерения позиции
- Поддержка анимаций выделения

#### ChatListWithReactions.tsx
- Мапа `messageRefs` для хранения ссылок на сообщения
- Исправленный double-tap с использованием ref
- Единый обработчик для long-press и double-tap

#### ReactionBar.tsx
- Новые пропсы: `visible`, `anchor`, `onClose`
- Подготовка под `getActions` для ActionsBar
- Улучшенное позиционирование с учетом safe area

### 🎯 Как использовать

#### Открытие панели реакций
```typescript
// Long-press или double-tap
const ref = messageRefs.current.get(messageId);
if (ref) openAtMessage(messageId, ref);
```

#### Подключение ActionsBar (будущее)
```typescript
const getActions = (message: Message): ActionItem[] => [
  { key: 'reply', icon: <ReplyIcon />, onPress: () => reply(message) },
  { key: 'copy', icon: <CopyIcon />, onPress: () => copy(message.text) },
];

<ReactionBar
  visible={visible}
  anchor={anchor}
  onClose={close}
  getActions={getActions}
/>
```

### 🧪 Проверки

- ✅ Long-press и double-tap открывают панель в одном месте
- ✅ Скролл/тап вне/выбор реакции/клавиатура закрывают панель
- ✅ Нет "прыжков" позиции при inverted списке
- ✅ Панель не рендерится без валидного anchor
- ✅ Учет safe area и краев экрана

### 📦 Зависимости

- `react-native-portalize` - для оверлеев
- `react-native-safe-area-context` - для safe area

## Будущее развитие

1. **ActionsBar** - меню действий (reply, copy, delete)
2. **Кастомные анимации** - уникальные переходы
3. **Расширенные жесты** - swipe для быстрых реакций
4. **Групповые действия** - массовые операции с сообщениями
