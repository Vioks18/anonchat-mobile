const fs = require('fs');
const path = require('path');

// Функция для восстановления резервной копии
function restoreBackup() {
  const backupFile = path.join(__dirname, 'app/screens/ChatScreen.backup.tsx');
  const mainFile = path.join(__dirname, 'app/screens/ChatScreen.tsx');
  
  try {
    // Проверяем существование резервной копии
    if (fs.existsSync(backupFile)) {
      // Копируем резервную копию в основной файл
      const backupContent = fs.readFileSync(backupFile, 'utf8');
      fs.writeFileSync(mainFile, backupContent);
      console.log('✅ Резервная копия успешно восстановлена!');
      return true;
    } else {
      console.log('❌ Резервная копия не найдена');
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при восстановлении:', error.message);
    return false;
  }
}

// Функция для создания резервной копии
function createBackup() {
  const mainFile = path.join(__dirname, 'app/screens/ChatScreen.tsx');
  const backupFile = path.join(__dirname, 'app/screens/ChatScreen.backup.tsx');
  
  try {
    if (fs.existsSync(mainFile)) {
      const content = fs.readFileSync(mainFile, 'utf8');
      fs.writeFileSync(backupFile, content);
      console.log('✅ Резервная копия создана!');
      return true;
    } else {
      console.log('❌ Основной файл не найден');
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при создании резервной копии:', error.message);
    return false;
  }
}

// Проверяем аргументы командной строки
const command = process.argv[2];

if (command === 'restore') {
  restoreBackup();
} else if (command === 'backup') {
  createBackup();
} else {
  console.log('Использование:');
  console.log('  node restore-backup.js backup   - создать резервную копию');
  console.log('  node restore-backup.js restore  - восстановить резервную копию');
} 