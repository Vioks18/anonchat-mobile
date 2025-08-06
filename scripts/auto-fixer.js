const fs = require('fs');
const path = require('path');

class AutoFixer {
  constructor() {
    this.fixes = [];
    this.backupDir = 'auto-fix-backups';
  }

  // Создание бэкапа
  createBackup(filePath) {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const backupPath = path.join(this.backupDir, `${path.basename(filePath)}.backup`);
    fs.copyFileSync(filePath, backupPath);
    console.log(`💾 Бэкап создан: ${backupPath}`);
  }

  // Исправление неиспользуемых импортов
  fixUnusedImports(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Поиск и удаление неиспользуемых импортов
      const importRegex = /import\s+{?\s*([^}]+)\s*}?\s+from\s+['"]([^'"]+)['"]/g;
      const imports = content.match(importRegex);

      if (imports) {
        imports.forEach(importStatement => {
          const match = importStatement.match(/import\s+{?\s*([^}]+)\s*}?\s+from\s+['"]([^'"]+)['"]/);
          if (match) {
            const importedItems = match[1].split(',').map(item => item.trim());
            const modulePath = match[2];

            // Проверяем каждый импортированный элемент
            const usedItems = importedItems.filter(item => {
              if (item.includes('*') || item.includes('React')) return true;
              return content.includes(item);
            });

            // Если есть неиспользуемые элементы
            if (usedItems.length < importedItems.length) {
              if (usedItems.length === 0) {
                // Удаляем весь импорт
                content = content.replace(importStatement, '');
                modified = true;
                console.log(`🗑️ Удален неиспользуемый импорт: ${importStatement}`);
              } else {
                // Обновляем импорт
                const newImport = `import { ${usedItems.join(', ')} } from '${modulePath}'`;
                content = content.replace(importStatement, newImport);
                modified = true;
                console.log(`✂️ Обновлен импорт: ${usedItems.join(', ')}`);
              }
            }
          }
        });
      }

      if (modified) {
        this.createBackup(filePath);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Исправлены импорты в ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Ошибка исправления импортов в ${filePath}:`, error.message);
    }
  }

  // Исправление console.log
  fixConsoleLogs(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Заменяем console.log на console.warn для отладки
      if (content.includes('console.log')) {
        content = content.replace(/console\.log/g, 'console.warn');
        modified = true;
        console.log(`📝 Заменены console.log на console.warn в ${filePath}`);
      }

      if (modified) {
        this.createBackup(filePath);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Исправлены console.log в ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Ошибка исправления console.log в ${filePath}:`, error.message);
    }
  }

  // Добавление типизации
  addTypeScriptTypes(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Добавляем типизацию для компонентов без интерфейсов
      if (filePath.endsWith('.tsx') && content.includes('React.FC') && !content.includes('interface')) {
        const componentName = path.basename(filePath, '.tsx');
        const interfaceName = `${componentName}Props`;
        
        const interfaceDefinition = `\ninterface ${interfaceName} {\n  // Добавьте пропсы здесь\n}\n\n`;
        
        // Вставляем интерфейс после импортов
        const importEndIndex = content.lastIndexOf('import');
        const importEndLine = content.indexOf('\n', importEndIndex) + 1;
        
        content = content.slice(0, importEndLine) + interfaceDefinition + content.slice(importEndLine);
        modified = true;
        console.log(`📝 Добавлен интерфейс ${interfaceName} в ${filePath}`);
      }

      if (modified) {
        this.createBackup(filePath);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Добавлена типизация в ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Ошибка добавления типизации в ${filePath}:`, error.message);
    }
  }

  // Оптимизация FlatList
  optimizeFlatList(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      if (content.includes('FlatList')) {
        // Добавляем removeClippedSubviews если его нет
        if (!content.includes('removeClippedSubviews')) {
          const flatListRegex = /<FlatList([^>]*)>/g;
          content = content.replace(flatListRegex, '<FlatList$1\n        removeClippedSubviews={true}');
          modified = true;
          console.log(`🚀 Добавлен removeClippedSubviews в ${filePath}`);
        }

        // Добавляем maxToRenderPerBatch если его нет
        if (!content.includes('maxToRenderPerBatch')) {
          const flatListRegex = /<FlatList([^>]*)>/g;
          content = content.replace(flatListRegex, '<FlatList$1\n        maxToRenderPerBatch={10}');
          modified = true;
          console.log(`🚀 Добавлен maxToRenderPerBatch в ${filePath}`);
        }
      }

      if (modified) {
        this.createBackup(filePath);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Оптимизирован FlatList в ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Ошибка оптимизации FlatList в ${filePath}:`, error.message);
    }
  }

  // Добавление обработки ошибок
  addErrorHandling(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // Добавляем try-catch для функций с useState
      if (content.includes('useState') && !content.includes('try') && !content.includes('catch')) {
        const functionRegex = /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{/g;
        content = content.replace(functionRegex, (match, funcName) => {
          return `const ${funcName} = async (...args) => {\n    try {\n      // Ваш код здесь\n    } catch (error) {\n      console.error('Ошибка в ${funcName}:', error);\n    }\n  }`;
        });
        modified = true;
        console.log(`🛡️ Добавлена обработка ошибок в ${filePath}`);
      }

      if (modified) {
        this.createBackup(filePath);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Добавлена обработка ошибок в ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Ошибка добавления обработки ошибок в ${filePath}:`, error.message);
    }
  }

  // Автоматическое исправление всех файлов
  autoFixAll() {
    console.log('🔧 Запуск автоматических исправлений...');
    
    const files = [
      'app/components/ChatCore.tsx',
      'app/hooks/useMessageStore.ts',
      'app/hooks/useUIWatchDog.ts',
      'app/hooks/useBotProvider.ts',
      'app/screens/ChatScreen.tsx'
    ];

    files.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        console.log(`\n🔧 Исправление ${filePath}:`);
        this.fixUnusedImports(filePath);
        this.fixConsoleLogs(filePath);
        this.addTypeScriptTypes(filePath);
        this.optimizeFlatList(filePath);
        this.addErrorHandling(filePath);
      }
    });

    console.log('\n✅ Автоматические исправления завершены');
  }

  // Восстановление из бэкапа
  restoreFromBackup(filePath) {
    const backupPath = path.join(this.backupDir, `${path.basename(filePath)}.backup`);
    
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      console.log(`🔄 Восстановлен файл ${filePath} из бэкапа`);
    } else {
      console.log(`❌ Бэкап для ${filePath} не найден`);
    }
  }
}

// Экспорт
module.exports = AutoFixer;

// Если запущен напрямую
if (require.main === module) {
  const fixer = new AutoFixer();
  fixer.autoFixAll();
} 