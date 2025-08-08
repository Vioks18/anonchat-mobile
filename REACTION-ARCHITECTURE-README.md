# Новая архитектура реакций AnonChat

## Обзор изменений

Реализована унифицированная система реакций с улучшенным позиционированием и подготовкой к ActionsBar.

## Ключевые изменения

### 1. Унифицированное открытие панели
- **Long-press** и **double-tap** теперь используют один путь через `openAtMessage()`
- Измерение позиции происходит через `UIManager.measureInWindow`
- Добавлена задержка для стабильности в inverted списках

### 2. Закрытие по клавиатуре
- Добавлены слушатели `keyboardDidShow` и `keyboardWillShow`
- Автоматическое закрытие панели при появлении клавиатуры

### 3. Безопасные зоны
- Использование `useSafeAreaInsets` для корректного позиционирования
- Учет status bar и других системных элементов

### 4. Подготовка к ActionsBar
- Создан компонент `ActionsBar.tsx` (пока скрыт)
- API для будущих действий: `reply`, `copy`, `delete`, `share`, `pin`

## API изменения

### useReactionState.ts
```typescript
// Новый API
const { 
  selectedMessageId, 
  anchor, 
  visible, 
  openAtMessage, 
  close 
} = useReactionState();

// Использование
await openAtMessage(messageId, viewRef);
```

### MessageWithReactions.tsx
```typescript
// Унифицированное открытие
const handleLongPress = () => {
  openAtMessage(message.id, rootRef.current);
};

const handlePress = () => {
  if (selectedMessageId === message.id && visible) {
    openAtMessage(message.id, rootRef.current);
  }
};
```

### ReactionBar.tsx
```typescript
// Новые пропсы
<ReactionBar
  visible={visible}
  anchor={anchor}
  onClose={close}
  onReactionSelect={handleReactionSelect}
  currentThemeData={currentThemeData}
  getActions={getActions} // Для будущего ActionsBar
  message={message}
/>
```

## ActionsBar API (будущее)

```typescript
export type ActionItem = {
  key: 'reply' | 'copy' | 'delete' | 'share' | 'pin';
  icon: ReactNode;
  onPress: () => void;
  visible?: boolean;
};

export type GetActions = (message: Message) => ActionItem[];

// Использование
const getActions = (message: Message) => [
  {
    key: 'reply',
    icon: <ReplyIcon />,
    onPress: () => handleReply(message),
    visible: true
  },
  {
    key: 'copy',
    icon: <CopyIcon />,
    onPress: () => handleCopy(message.text),
    visible: true
  }
];
```

## Проверки

✅ **Long-press** и **double-tap** открывают одну панель  
✅ **Скролл/тап вне/выбор реакции/клавиатура** закрывают панель  
✅ **Тени/цвета/анимации** сохранены  
✅ **Нет прыжков** позиции в inverted списках  
✅ **Место под ActionsBar** подготовлено  

## Совместимость

- ✅ Сохранены все существующие реакции
- ✅ Не изменены публичные API ChatCore
- ✅ Оптимизации FlatList не затронуты
- ✅ Тема и анимации работают как прежде
