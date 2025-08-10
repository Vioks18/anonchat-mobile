# AnonChat QA Rules

## 🚀 Новая QA система (v2.0)

### Режимы работы
- **strict** (по умолчанию) - исключает experimental правила и allowlist файлы
- **soft** - включает все правила для полной проверки
- **ui** - только UI/лейаут проверки
- **perf** - только производительность проверки

### Команды
```bash
npm run qa              # Обычная проверка (strict режим)
npm run qa:strict       # Строгий режим (без experimental)
npm run qa:soft         # Мягкий режим (все правила)
npm run qa:ui           # Только UI/лейаут проверки
npm run qa:perf         # Только производительность
npm run qa:debug        # С детальным выводом
npm run qa:fix          # Автоисправление P0 проблем
npm run qa:baseline:update  # Обновить baseline
```

### Baseline система
- `qa-baseline.json` - сохраняет текущее состояние проблем
- Новые проблемы помечаются как **NEW**
- Отслеживание прогресса между проверками

### Pre-commit защита
- Автоматический запуск `npm run qa:strict` при коммите
- Блокировка при наличии P0 ошибок
- Проверка QA-REPORT.md на критические проблемы

## 🔒 Manual Lock-чеклист

После любых автофиксов **обязательно** проверить вручную:

### 1. Моё короткое сообщение
- ✅ Время+галочки внутри пузыря
- ✅ Ничего не "плывёт" за границы
- ✅ Компактный размер

### 2. Моё длинное сообщение  
- ✅ Текст доходит до края экрана
- ✅ Мета блок внутри пузыря
- ✅ Нет налезаний текста на время

### 3. Чужое сообщение
- ✅ Время видно и читаемо
- ✅ Нет смещений элементов
- ✅ Правильное выравнивание

### 4. Long-press реакции
- ✅ Панель реакций появляется в месте касания
- ✅ Начало скролла закрывает панель
- ✅ Правильное позиционирование

### 5. Мультивыбор
- ✅ Верхняя панель с счётчиком
- ✅ Кнопка "очистить" снимает фон у всех
- ✅ Правильная работа toolbar

## 📋 Все rule-id и их назначение

### P0 (Критические)
- **reactionbar.guard** - Проверка раннего выхода в ReactionBar (!visible || !anchor)
- **store.status_read** - Статус 'read' должен быть в валидных статусах
- **perf.dev_logs** - Console.log должны быть обернуты в __DEV__
- **secrets.regex** - Поиск секретов в коде (API_KEY, SECRET, Bearer)
- **secrets.env_gitignore** - .env файл должен быть в .gitignore
- **secrets.patterns** - Расширенный поиск секретов (API_KEY|SECRET|TOKEN|DSN|BEARER)

### P1 (Важные)
- **chatlist.scroll_close** - Закрытие меню при скролле
- **reactionstate.keyboard_close** - Обработка клавиатуры (experimental)
- **perf.memo_bubble** - Мемоизация компонентов сообщений
- **perf.stable_handlers** - Стабильные обработчики через useCallback
- **bubble.meta.pointerEvents** - Meta блок с pointerEvents="none"
- **bubble.text.minWidth0** - Текстовый контейнер с minWidth: 0
- **bubble.noWidth100** - Запрет width:'100%' на пузырях
- **bubble.paddingRight.meta** - PaddingRight >= 28 для мета
- **scroll.gate** - Блокировка тапов при скролле
- **reactionbar.pointerEvents** - Правильные pointerEvents в ReactionBar
- **anchor.touchXY** - Поддержка touchX/touchY координат
- **ui.layout.meta_inside** - Мета блок внутри пузыря (position:'absolute', right>=6, bottom>=2, paddingBottom>=14)
- **ui.text.shrink_ok** - Текст с minWidth: 0 и flexShrink: 1 (игнорирует однословные < 50dp)
- **ui.pointer.safe** - ReactionBar: внешний 'box-none', внутренний 'auto'
- **perf.memo** - Компоненты сообщений обернуты в React.memo

### P2 (Рекомендации)
- **reactionbar.clamp_flip_safe** - Безопасное позиционирование панели (experimental)
- **deps.unused** - Список неиспользуемых зависимостей
- **.env.gitignore** - .env файл в .gitignore
- **deps.heavy_inactive** - Тяжелые неиспользуемые пакеты (reanimated, gesture-handler, camera, notifications, etc.)

## 🧪 Self-test фикстуры

| Фикстура | Ожидаемое правило | Описание |
|----------|------------------|----------|
| `bubble_bad_padding.tsx` | `ui.layout.meta_inside` | Нет paddingBottom при наличии меты |
| `text_no_minwidth.tsx` | `ui.text.shrink_ok` | Текст без minWidth: 0 и flexShrink: 1 |
| `pointer_bad.tsx` | `ui.pointer.safe` | Неправильные pointerEvents |
| `console_spam.ts` | `perf.dev_logs` | Голые console.log без __DEV__ |
| `memo_missing.tsx` | `perf.memo` | Компонент без React.memo |
| `reaction_guard_missing.tsx` | `reactionbar.guard` | Без проверки if (!visible \|\| !anchor) |

## 🎨 Новые UI правила (v2.1)

### ui.layout.meta_inside
**Проверяет:** Мета блок (время+чеки) расположен внутри пузыря
**Требования:**
- `position: 'absolute'`
- `right >= 6`
- `bottom >= 2`
- `paddingBottom >= 14` у контейнера

**Пример:**
```typescript
// ✅ Правильно
const styles = StyleSheet.create({
  bubble: {
    paddingBottom: 20, // >= 14
  },
  metaRow: {
    position: 'absolute',
    right: 8, // >= 6
    bottom: 6, // >= 2
  }
});

// ❌ Неправильно
const styles = StyleSheet.create({
  bubble: {
    paddingBottom: 10, // < 14
  },
  metaRow: {
    position: 'absolute',
    right: 4, // < 6
    bottom: 1, // < 2
  }
});
```

### ui.text.shrink_ok
**Проверяет:** Текст правильно сжимается
**Требования:**
- `minWidth: 0` на Text
- `flexShrink: 1` на обертке сообщения
- Игнорирует однословные тексты < 50dp

**Пример:**
```typescript
// ✅ Правильно
const styles = StyleSheet.create({
  messageText: {
    minWidth: 0,
  },
  messageWrapper: {
    flexShrink: 1,
  }
});

// ❌ Неправильно
const styles = StyleSheet.create({
  messageText: {
    // нет minWidth: 0
  },
  messageWrapper: {
    // нет flexShrink: 1
  }
});
```

### ui.pointer.safe
**Проверяет:** Правильные pointerEvents в ReactionBar
**Требования:**
- Внешний контейнер: `pointerEvents="box-none"`
- Внутренний контейнер: `pointerEvents="auto"`

**Пример:**
```typescript
// ✅ Правильно
<Animated.View pointerEvents="box-none">
  <View pointerEvents="auto">
    {/* реакция */}
  </View>
</Animated.View>

// ❌ Неправильно
<Animated.View pointerEvents="auto">
  <View pointerEvents="none">
    {/* реакция */}
  </View>
</Animated.View>
```

## ⚡ Новые Perf правила (v2.1)

### perf.memo
**Проверяет:** Компоненты сообщений обернуты в React.memo
**Требования:**
- `React.memo(Component)` или кастомный `memo(Component, areEqual)`

**Пример:**
```typescript
// ✅ Правильно
export default React.memo(MessageWithReactions);

// ✅ Также правильно
export default memo(MessageWithReactions, (prev, next) => {
  return prev.message.id === next.message.id;
});

// ❌ Неправильно
export default MessageWithReactions;
```

## 🔒 Расширенные правила безопасности (v2.1)

### secrets.patterns
**Проверяет:** Расширенный поиск секретов
**Паттерны:**
- `API_KEY|SECRET|TOKEN|DSN|BEARER\\s+[A-Za-z0-9\\._\\-]+`
- `.env/.env.local` файлы (исключая .example)

**Пример:**
```typescript
// ❌ Найдет эти секреты
const API_KEY = "sk-1234567890abcdef";
const SECRET = "my-secret-key";
const TOKEN = "bearer-token-123";
const DSN = "https://sentry.io/123";

// ✅ Безопасно
const API_KEY = process.env.API_KEY;
const SECRET = process.env.SECRET;
```

### deps.heavy_inactive
**Проверяет:** Тяжелые неиспользуемые пакеты
**Список тяжелых пакетов:**
- `react-native-reanimated`
- `react-native-gesture-handler`
- `react-native-camera`
- `expo-notifications`
- `react-native-vision-camera`
- `react-native-video`
- `@react-native-firebase/*`
- `sentry-*`
- `realm`

**Действие:** Помечает как candidate (только предупреждение, не P0)

## 🔧 Автофиксы (только P0)

### status.read
- Добавляет 'read' в массив валидных статусов
- Заменяет 'error' на 'read' если нужно

### perf.dev_logs
- Оборачивает console.log и console.warn в if (__DEV__)
- Оставляет console.error как есть
- Игнорирует закомментированные строки

## 📊 Отчеты

### QA-REPORT.md
- **Mode** - текущий режим (strict/soft/ui/perf)
- **New issues** - количество новых проблем
- Список пройденных проверок
- Предупреждения (P1, P2) с пометкой **NEW**
- Критические ошибки (P0)

### sim-report.json
- Метрики производительности
- Результаты симуляции
- Время выполнения тестов

### layout-report.json (DEV)
- Статистика layout проблем
- Dead zone предупреждения
- Meta out of bounds счетчики

## 🛡️ Защита от console.log

### Автоматическая очистка
- Все активные console.log обернуты в `if (__DEV__)`
- Удалены закомментированные console.* строки
- Pre-commit хук блокирует незащищенные логи

### Правила для разработчиков
1. Все console.log должны быть в `if (__DEV__)`
2. Удаляйте закомментированные console.* строки
3. Используйте console.error для критических ошибок
4. Pre-commit хук автоматически проверит код

## 🔍 Debug режим

### Использование
```bash
npm run qa:debug
# или
node scripts/qa/scan.js --debug
```

### Что показывает
- Пропущенные experimental правила
- Детали о неудачных проверках
- Причины блокировки allowlist файлов
- Информацию о baseline сравнении

## 🎯 Double-tap guard

### Сбор данных жестов
1. **Запустите приложение в DEV режиме**
2. **Выполните сценарии:**
   - Быстрые двойные тапы на коротких сообщениях
   - Двойные тапы на длинных сообщениях
   - Двойные тапы во время скролла
   - Двойные тапы с открытой клавиатурой
3. **Данные автоматически сохраняются в `gesture-report.json`**

### Запуск диагностики
```bash
npm run qa:gestures
```

### Пороги качества
- **lateSecondTap**: 0 (второй тап не должен быть позже 300ms)
- **duringScroll**: 0 (двойные тапы не должны быть во время скролла)
- **openLatencyP95**: ≤300ms (95% открытий панели должны быть быстрыми)
- **openTooFar**: 0 (панель не должна открываться далеко от точки касания)

### При срабатывании порогов
1. **lateSecondTap > 0**: Увеличьте окно двойного тапа или улучшите логику
2. **duringScroll > 0**: Добавьте блокировку тапов во время скролла
3. **openLatencyP95 > 300ms**: Оптимизируйте рендеринг панели реакций
4. **openTooFar > 0**: Исправьте позиционирование панели относительно точки касания

### Ограничения
- Работает только в DEV режиме
- Требует ручного тестирования жестов
- Не заменяет автоматические тесты
