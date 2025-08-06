const fs = require('fs');
const path = require('path');

// Критически важные файлы для бэкапа
const CRITICAL_FILES = [
  'app/components/ChatCore.tsx',
  'app/hooks/useMessageStore.ts',
  'app/screens/ChatScreen.tsx',
  'app/index.tsx',
  'app/components/UIErrorBoundary.tsx',
  'app/context/ChatLogicProvider.tsx',
  'app.config.js'
];

// Создать бэкап всех критических файлов
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backup/${timestamp}`;
  
  console.log('🔄 Создание бэкапа...');
  
  // Создать папку для бэкапа
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  CRITICAL_FILES.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const backupPath = path.join(backupDir, path.basename(file) + '.backup');
        fs.copyFileSync(file, backupPath);
        console.log(`✅ ${file} -> ${backupPath}`);
        successCount++;
      } else {
        console.log(`⚠️  Файл не найден: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Ошибка при бэкапе ${file}:`, error.message);
      errorCount++;
    }
  });
  
  console.log(`\n📊 Результат: ${successCount} успешно, ${errorCount} ошибок`);
  console.log(`📁 Бэкап сохранен в: ${backupDir}`);
  
  // Создать метаданные бэкапа
  const metadata = {
    timestamp: new Date().toISOString(),
    files: CRITICAL_FILES.filter(file => fs.existsSync(file)),
    successCount,
    errorCount,
    description: process.argv[3] || 'Автоматический бэкап'
  };
  
  fs.writeFileSync(
    path.join(backupDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
}

// Восстановить из бэкапа
function restoreFromBackup(backupPath) {
  console.log(`🔄 Восстановление из бэкапа: ${backupPath}`);
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Бэкап не найден: ${backupPath}`);
    return;
  }
  
  const files = fs.readdirSync(backupPath);
  let successCount = 0;
  let errorCount = 0;
  
  files.forEach(file => {
    if (file.endsWith('.backup')) {
      try {
        const originalFile = file.replace('.backup', '');
        const backupFile = path.join(backupPath, file);
        const targetFile = path.join('app', originalFile);
        
        // Создать папку если не существует
        const targetDir = path.dirname(targetFile);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        fs.copyFileSync(backupFile, targetFile);
        console.log(`✅ ${backupFile} -> ${targetFile}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Ошибка при восстановлении ${file}:`, error.message);
        errorCount++;
      }
    }
  });
  
  console.log(`\n📊 Восстановлено: ${successCount} файлов, ${errorCount} ошибок`);
}

// Список доступных бэкапов
function listBackups() {
  console.log('📋 Доступные бэкапы:');
  
  if (!fs.existsSync('backup')) {
    console.log('❌ Папка backup не найдена');
    return;
  }
  
  const backups = fs.readdirSync('backup')
    .filter(item => fs.statSync(path.join('backup', item)).isDirectory())
    .sort()
    .reverse();
  
  if (backups.length === 0) {
    console.log('❌ Бэкапы не найдены');
    return;
  }
  
  backups.forEach(backup => {
    const backupPath = path.join('backup', backup);
    const metadataPath = path.join(backupPath, 'metadata.json');
    
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      console.log(`📁 ${backup} - ${metadata.description} (${metadata.successCount} файлов)`);
    } else {
      console.log(`📁 ${backup}`);
    }
  });
}

// Главная функция
function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
    case 'backup':
      createBackup();
      break;
      
    case 'restore':
      const backupPath = process.argv[3];
      if (!backupPath) {
        console.error('❌ Укажите путь к бэкапу');
        console.log('Пример: node scripts/backup.js restore backup/2024-01-15T10-30-00');
        return;
      }
      restoreFromBackup(backupPath);
      break;
      
    case 'list':
      listBackups();
      break;
      
    default:
      console.log('🔄 Система бэкапов AnonChat');
      console.log('\nКоманды:');
      console.log('  node scripts/backup.js backup    - Создать бэкап');
      console.log('  node scripts/backup.js restore   - Восстановить из бэкапа');
      console.log('  node scripts/backup.js list      - Список бэкапов');
      console.log('\nПримеры:');
      console.log('  node scripts/backup.js backup "Добавлены темы"');
      console.log('  node scripts/backup.js restore backup/2024-01-15T10-30-00');
  }
}

main(); 