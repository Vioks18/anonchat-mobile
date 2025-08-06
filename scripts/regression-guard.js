const fs = require('fs');
const path = require('path');

class RegressionGuard {
  constructor() {
    this.backupDir = 'backups/regression-guard';
    this.criticalFiles = [
      'app/components/ChatCore.tsx',
      'app/components/ChatMenu.tsx',
      'app/components/ChatInput.tsx',
      'app/components/ChatList.tsx'
    ];
    this.snapshotFile = path.join(this.backupDir, 'working-snapshot.json');
  }

  // Создать снапшот рабочего состояния
  createSnapshot() {
    try {
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }

      const snapshot = {
        timestamp: new Date().toISOString(),
        files: {}
      };

      this.criticalFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          snapshot.files[filePath] = {
            content: fs.readFileSync(filePath, 'utf8'),
            size: fs.statSync(filePath).size,
            hash: this.simpleHash(fs.readFileSync(filePath, 'utf8'))
          };
        }
      });

      fs.writeFileSync(this.snapshotFile, JSON.stringify(snapshot, null, 2));
      console.log('✅ Снапшот рабочего состояния создан');
      return true;
    } catch (error) {
      console.error('❌ Ошибка создания снапшота:', error.message);
      return false;
    }
  }

  // Проверить изменения в критических файлах
  checkChanges() {
    try {
      if (!fs.existsSync(this.snapshotFile)) {
        console.log('⚠️ Снапшот не найден, создаю новый...');
        return this.createSnapshot();
      }

      const snapshot = JSON.parse(fs.readFileSync(this.snapshotFile, 'utf8'));
      const changes = [];

      this.criticalFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const currentContent = fs.readFileSync(filePath, 'utf8');
          const currentHash = this.simpleHash(currentContent);
          
          if (snapshot.files[filePath] && snapshot.files[filePath].hash !== currentHash) {
            changes.push({
              file: filePath,
              oldSize: snapshot.files[filePath].size,
              newSize: fs.statSync(filePath).size,
              changed: true
            });
          }
        }
      });

      if (changes.length > 0) {
        console.log('⚠️ Обнаружены изменения в критических файлах:');
        changes.forEach(change => {
          console.log(`  📁 ${change.file} (${change.oldSize} → ${change.newSize} байт)`);
        });
        return false;
      }

      console.log('✅ Критические файлы не изменились');
      return true;
    } catch (error) {
      console.error('❌ Ошибка проверки изменений:', error.message);
      return false;
    }
  }

  // Восстановить из снапшота
  restoreFromSnapshot() {
    try {
      if (!fs.existsSync(this.snapshotFile)) {
        console.log('❌ Снапшот не найден');
        return false;
      }

      const snapshot = JSON.parse(fs.readFileSync(this.snapshotFile, 'utf8'));
      let restored = 0;

      Object.entries(snapshot.files).forEach(([filePath, fileData]) => {
        if (fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, fileData.content);
          restored++;
          console.log(`✅ Восстановлен: ${filePath}`);
        }
      });

      console.log(`✅ Восстановлено файлов: ${restored}`);
      return restored > 0;
    } catch (error) {
      console.error('❌ Ошибка восстановления:', error.message);
      return false;
    }
  }

  // Простая хеш-функция
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  // Проверить целостность компонентов
  checkComponentIntegrity() {
    const issues = [];
    
    this.criticalFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Проверка импортов
        if (content.includes('import') && !content.includes('export')) {
          issues.push(`${filePath}: Файл импортирует, но не экспортирует`);
        }
        
        // Проверка стилей
        if (content.includes('StyleSheet.create') && !content.includes('const styles')) {
          issues.push(`${filePath}: Стили созданы, но не присвоены переменной`);
        }
        
        // Проверка пропсов
        if (content.includes('interface') && !content.includes('Props')) {
          issues.push(`${filePath}: Интерфейс без Props`);
        }
      }
    });

    if (issues.length > 0) {
      console.log('⚠️ Проблемы целостности компонентов:');
      issues.forEach(issue => console.log(`  ❌ ${issue}`));
      return false;
    }

    console.log('✅ Целостность компонентов проверена');
    return true;
  }

  // Автоматическая защита перед изменениями
  guardBeforeChanges() {
    console.log('🛡️ Активирую защиту от регрессий...');
    
    if (!this.checkChanges()) {
      console.log('⚠️ Обнаружены изменения! Создаю новый снапшот...');
      this.createSnapshot();
    }
    
    if (!this.checkComponentIntegrity()) {
      console.log('⚠️ Проблемы целостности! Проверьте код перед изменениями.');
      return false;
    }
    
    console.log('✅ Защита активирована, можно вносить изменения');
    return true;
  }
}

// Экспорт для использования
module.exports = RegressionGuard;

// Если запущен напрямую
if (require.main === module) {
  const guard = new RegressionGuard();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'snapshot':
      guard.createSnapshot();
      break;
    case 'check':
      guard.checkChanges();
      break;
    case 'restore':
      guard.restoreFromSnapshot();
      break;
    case 'guard':
      guard.guardBeforeChanges();
      break;
    case 'integrity':
      guard.checkComponentIntegrity();
      break;
    default:
      console.log(`
🛡️ Regression Guard - Защита от регрессий

Использование:
  node scripts/regression-guard.js snapshot  - Создать снапшот
  node scripts/regression-guard.js check     - Проверить изменения
  node scripts/regression-guard.js restore   - Восстановить из снапшота
  node scripts/regression-guard.js guard     - Активировать защиту
  node scripts/regression-guard.js integrity - Проверить целостность
      `);
  }
}
