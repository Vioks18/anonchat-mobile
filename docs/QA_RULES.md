# AnonChat QA Rules

## 🚀 Новая QA система (v2.0)

### Режимы работы
- **strict** (по умолчанию) - исключает experimental правила и allowlist файлы
- **soft** - включает все правила для полной проверки

### Команды
```bash
npm run qa              # Обычная проверка (strict режим)
npm run qa:strict       # Строгий режим (без experimental)
npm run qa:soft         # Мягкий режим (все правила)
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

## 📋 Все rule-id и их назначение

### P0 (Критические)
- **reactionbar.anchor_guard** - Проверка раннего выхода в ReactionBar
- **store.status_read** - Статус 'read' должен быть в валидных статусах
- **perf.dev_logs** - Console.log должны быть обернуты в __DEV__
- **reactionbar.guard** - Дублирует anchor_guard для надежности
- **status.read** - Дублирует store.status_read
- **secrets.regex** - Поиск секретов в коде (API_KEY, SECRET, Bearer)

### P1 (Важные)
- **chatlist.scroll_close** - Закрытие меню при скролле
- **reactionstate.keyboard_close** - Обработка клавиатуры (experimental)
- **perf.memo_bubble** - Мемоизация компонентов сообщений
- **perf.stable_handlers** - Стабильные обработчики через useCallback
- **bubble.meta.pointerEvents** - Meta блок с pointerEvents="none"
- **bubble.text.minWidth0** - Текстовый контейнер с minWidth: 0
- **bubble.noWidth100** - Запрет width:'100%' на пузырях
- **bubble.paddingRight.meta** - PaddingRight >= 28 для мета
- **doubleTap.window** - Окно дабл-тапа 220–300ms
- **scroll.gate** - Блокировка тапов при скролле
- **reactionbar.pointerEvents** - Правильные pointerEvents в ReactionBar
- **anchor.touchXY** - Поддержка touchX/touchY координат

### P2 (Рекомендации)
- **reactionbar.clamp_flip_safe** - Безопасное позиционирование панели (experimental)
- **chatlist.doubletap_window** - Дублирует doubleTap.window
- **deps.unused** - Список неиспользуемых зависимостей
- **.env.gitignore** - .env файл в .gitignore

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
- **Mode** - текущий режим (strict/soft)
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
