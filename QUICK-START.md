# 🚀 AnonChat Mobile - Быстрый старт

## ⚡ Быстрая настройка

### 1. Установка
```bash
git clone <repository>
cd anonchat-mobile
npm install
```

### 2. Запуск
```bash
npm start
# или
npm run android
```

### 3. QA проверка
```bash
npm run qa
```

## 🛡️ QA система (обязательно!)

### Первая проверка
```bash
# Проверка качества кода
npm run qa

# Если есть проблемы - автоисправление
npm run qa:fix

# Детальная диагностика
npm run qa:debug
```

### Ежедневная работа
```bash
# Перед коммитом (автоматически)
git commit -m "feat: new feature"

# При проблемах
npm run qa:debug

# Обновление baseline
npm run qa:baseline:update
```

## 📋 Правила разработки

### ✅ Обязательно
1. **Все console.log в `if (__DEV__)`**
2. **TypeScript типизация**
3. **Максимум 300 строк на файл**
4. **Мемоизация компонентов**

### ❌ Запрещено
1. **Изменять ChatCore.tsx** (защищен)
2. **Console.log без __DEV__**
3. **Файлы больше 500 строк**
4. **Мутация объектов стилей**

## 🔧 Основные команды

```bash
# Разработка
npm start              # Запуск Expo
npm run android        # Запуск на Android
npm run build          # Сборка

# QA система
npm run qa             # Проверка качества
npm run qa:strict      # Строгий режим
npm run qa:soft        # Мягкий режим
npm run qa:debug       # Отладка
npm run qa:fix         # Автоисправление

# Git workflow
npm run prefeature     # Создание новой фичи
npm run backup         # Создание бэкапа
npm run guard:install  # Установка pre-commit хука
```

## 🏗️ Структура проекта

```
app/
├── components/        # React компоненты
├── hooks/            # Кастомные хуки
├── utils/            # Утилиты
└── providers/        # Провайдеры

scripts/
├── qa/               # QA система
├── sim/              # Симуляция
└── guard/            # Pre-commit хуки

docs/
├── QA_RULES.md       # Правила QA
└── LOCKS.md         # Критические инварианты
```

## 🚨 Важные файлы

- **ChatCore.tsx** - НЕ ИЗМЕНЯТЬ (защищен)
- **QA-REPORT.md** - результаты проверки качества
- **qa-baseline.json** - baseline для отслеживания
- **package.json** - только через npm/yarn

## 📚 Документация

- [QA Rules](./docs/QA_RULES.md) - полные правила QA
- [Project Structure](./PROJECT-STRUCTURE.md) - архитектура
- [Reactions](./REACTIONS-IMPLEMENTATION.md) - система реакций

## 🆘 Решение проблем

### QA блокирует коммит
```bash
npm run qa:fix        # Автоисправление
npm run qa:debug      # Диагностика
```

### Ошибки TypeScript
```bash
npm run qa:debug      # Найти проблемные файлы
# Исправить типы в указанных файлах
```

### Проблемы с производительностью
```bash
npm run sim           # Запуск симуляции
# Проверить sim-report.json
```

## 🎯 Workflow

1. **Создание фичи**
   ```bash
   npm run prefeature
   # Следуйте инструкциям
   ```

2. **Разработка**
   ```bash
   npm start
   # Код в app/
   ```

3. **Проверка**
   ```bash
   npm run qa
   npm run qa:fix  # если нужно
   ```

4. **Коммит**
   ```bash
   git add .
   git commit -m "feat: description"
   # Pre-commit хук автоматически проверит код
   ```

5. **Push**
   ```bash
   git push
   ```

## 🚀 Готово!

Теперь ты готов к разработке AnonChat Mobile! 

**Помни:** QA система - твой друг, она защищает от ошибок и поддерживает качество кода. 🛡️✨
