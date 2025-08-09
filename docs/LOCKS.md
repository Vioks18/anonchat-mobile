# AnonChat Locks & Invariants

## 🚫 Что нельзя ломать

### Message Bubbles
- **Корневой Pressable у пузыря** - должен оставаться для обработки тапов
- **Meta с pointerEvents:'none'** - метаданные не должны перехватывать тапы
- **minWidth:0 у текста** - текстовый контейнер должен сжиматься
- **Отсутствие width:'100%' на пузыре** - пузырь должен адаптироваться

### Double-tap Logic
- **Окно дабл-тапа 220–300ms** - оптимальный диапазон для пользователей
- **Scroll-gate** - тапы должны блокироваться во время скролла

### Reaction Bar
- **Guard if (!visible || !anchor) return null** - ранний выход при отсутствии данных
- **Внешний pointerEvents="box-none"** - пропуск тапов через контейнер
- **Внутренний pointerEvents="auto"** - обработка тапов на панели

### Performance
- **React.memo на MessageWithReactions** - предотвращение лишних ререндеров
- **useCallback для обработчиков** - стабильные ссылки на функции

### Security
- **Нет console.log в продакшене** - все логи должны быть в __DEV__
- **Нет секретов в коде** - API_KEY, SECRET, Bearer токены запрещены

## 🔒 Защита от регресса

### Pre-commit Hooks
- `npm run guard:install` - установка pre-commit хука
- `npm run qa` - проверка всех правил
- Блокировка коммита при P0 ошибках

### Snapshots
- `npm run guard:snapshot` - создание снапшота перед фичей
- Тег STABLE для стабильных версий

### Monitoring
- `npm run sim` - симуляция нагрузочного тестирования
- `npm run qa:sim` - полная проверка + симуляция
