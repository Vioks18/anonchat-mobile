#!/bin/bash

# Git Auto Backup Script
# Usage: ./git-backup.sh [commit_message]

# Получаем сообщение коммита
if [ $# -eq 0 ]; then
    # Если аргумент не передан, используем сообщение по умолчанию
    COMMIT_MESSAGE="🛠 Авто-бэкап: $(date '+%Y-%m-%d %H:%M:%S')"
else
    # Используем переданное сообщение
    COMMIT_MESSAGE="$1"
fi

# Выполняем git команды
echo "📦 Создание бэкапа..."
git add . > /dev/null 2>&1
git commit -m "$COMMIT_MESSAGE" > /dev/null 2>&1
git push > /dev/null 2>&1

# Проверяем результат
if [ $? -eq 0 ]; then
    echo "✅ Бэкап успешно создан: $COMMIT_MESSAGE"
else
    echo "❌ Ошибка при создании бэкапа"
    exit 1
fi
