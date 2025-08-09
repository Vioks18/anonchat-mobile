# AnonChat QA Rules

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
- **reactionstate.keyboard_close** - Обработка клавиатуры
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
- **reactionbar.clamp_flip_safe** - Безопасное позиционирование панели
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

## 📊 Отчеты

### QA-REPORT.md
- Список пройденных проверок
- Предупреждения (P1, P2)
- Критические ошибки (P0)

### sim-report.json
- Метрики производительности
- Результаты симуляции
- Время выполнения тестов

### layout-report.json (DEV)
- Статистика layout проблем
- Dead zone предупреждения
- Meta out of bounds счетчики
