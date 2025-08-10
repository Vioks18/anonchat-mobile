# AnonChat Mobile

[![QA Status](https://github.com/Vioks18/anonchat-mobile/workflows/QA%20Checks/badge.svg)](https://github.com/Vioks18/anonchat-mobile/actions/workflows/qa.yml)

Анонимный чат-клиент для Android с современным UI и продвинутой системой качества кода. (CI test - $(date))

## 🚀 Особенности

- **Анонимное общение** - без регистрации и личных данных
- **Современный UI** - адаптивные темы и анимации
- **Реакции на сообщения** - эмодзи-реакции с красивой анимацией
- **Продвинутая QA система** - автоматическая проверка качества кода
- **Pre-commit защита** - блокировка критических ошибок
- **TypeScript** - полная типизация
- **React Native + Expo** - кроссплатформенная разработка

## 🛠️ Технологии

- **React Native** - мобильная разработка
- **Expo** - инструменты разработки
- **TypeScript** - типизация
- **Zustand** - управление состоянием
- **React Native Gesture Handler** - жесты
- **Expo Vector Icons** - иконки

## 📱 Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start

# Запуск на Android
npm run android

# Сборка для продакшена
npm run build
```

## 🛡️ QA система (v2.0)

### Быстрый старт
```bash
# Проверка качества кода
npm run qa

# Автоисправление критических проблем
npm run qa:fix

# Детальная проверка с отладкой
npm run qa:debug
```

### Режимы работы
- **strict** (по умолчанию) - исключает experimental правила
- **soft** - полная проверка всех правил

### Как гонять QA

```bash
# Основные проверки
npm run qa:ui           # Только UI/лейаут проверки
npm run qa:perf         # Только производительность
npm run qa:strict       # Полная проверка (рекомендуется)

# Автофиксы (безопасно)
npm run qa:fix:safe     # DRY-RUN патчей (ничего не применяет)
npm run qa:fix:apply    # Применяет патчи в новой ветке и гоняет qa:strict

# Управление baseline
npm run qa:baseline:update  # Обновить baseline
```

**⚠️ Важно:** Автофиксы применяются только через `qa:fix:apply` и всегда в отдельной ветке с лимитами безопасности.

### Self-test ассистента

```bash
npm run qa:selftest    # Генерит фикстуры/мутации/снепшот и валидирует, что правила реально срабатывают
npm run qa:fixtures    # Прогон только по фикстурам
npm run qa:mutate      # Мутационное тестирование на копиях в qa/tmp
npm run qa:snap        # Обновить эталонный JSON-отчёт
```

### Pre-commit защита
- Автоматический запуск QA при коммите
- Блокировка при наличии P0 ошибок
- Защита от console.log в продакшене

## 📊 Отчеты

- **QA-REPORT.md** - результаты проверки качества
- **sim-report.json** - метрики производительности
- **qa-baseline.json** - baseline для отслеживания прогресса

## 🏗️ Архитектура

### Структура проекта
```
app/
├── components/          # React компоненты
│   ├── reactions/      # Система реакций
│   └── ...
├── hooks/              # Кастомные хуки
├── utils/              # Утилиты
└── providers/          # Провайдеры контекста

scripts/
├── qa/                 # QA система
│   ├── scan.js         # Основной сканер
│   └── rules.json      # Правила проверки
├── sim/                # Симуляция и тестирование
└── guard/              # Pre-commit хуки

docs/
├── QA_RULES.md         # Документация QA правил
└── LOCKS.md           # Критические инварианты
```

### Ключевые компоненты
- **ChatCore** - основной компонент чата (защищен от изменений)
- **MessageWithReactions** - сообщения с реакциями
- **ReactionBar** - панель реакций
- **ChatListWithReactions** - список сообщений

## 🔧 Разработка

### Правила кода
1. Все console.log должны быть в `if (__DEV__)`
2. Используйте TypeScript для типизации
3. Следуйте принципам функционального программирования
4. Мемоизируйте компоненты и обработчики

### Git workflow
```bash
# Создание новой фичи
npm run prefeature

# Проверка перед коммитом (автоматически)
git commit -m "feat: new feature"

# Создание бэкапа
npm run backup
```

### QA workflow
```bash
# Ежедневная проверка
npm run qa

# При проблемах
npm run qa:debug

# Автоисправление
npm run qa:fix

# Обновление baseline
npm run qa:baseline:update
```

## 📚 Документация

- [QA Rules](./docs/QA_RULES.md) - правила качества кода
- [Project Structure](./PROJECT-STRUCTURE.md) - структура проекта
- [Reactions Implementation](./REACTIONS-IMPLEMENTATION.md) - система реакций
- [ChatCore Protection](./CHATCORE-PROTECTION.md) - защита основного компонента

## 🚨 Важные заметки

- **ChatCore защищен** - не изменяйте без крайней необходимости
- **Pre-commit хук** - автоматически проверяет код при коммите
- **QA система** - блокирует критические ошибки
- **Baseline** - отслеживает прогресс качества

## 🤝 Вклад в проект

1. Создайте ветку для новой фичи
2. Следуйте правилам QA
3. Убедитесь что все тесты проходят
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл LICENSE для деталей.

---

**AnonChat Mobile** - современный анонимный чат с продвинутой системой качества кода. 🚀
