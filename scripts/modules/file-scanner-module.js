// Модуль сканера файлов - отдельный файл
const fs = require('fs');
const path = require('path');

class FileScannerModule {
  constructor() {
    this.directories = [
      'app/components',
      'app/hooks', 
      'app/screens',
      'app/providers',
      'app/context',
      'app/utils',
      'app/types'
    ];
  }

  // Получение всех файлов проекта
  getProjectFiles() {
    const files = [];
    
    this.directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        const dirFiles = fs.readdirSync(dir);
        files.push(...dirFiles.map(file => `${dir}/${file}`));
      }
    });

    return files.filter(file => 
      file.endsWith('.tsx') || file.endsWith('.ts')
    );
  }

  // Получение файлов по типу
  getFilesByType(type) {
    const typeDirectories = {
      components: 'app/components',
      hooks: 'app/hooks',
      screens: 'app/screens',
      providers: 'app/providers',
      context: 'app/context',
      utils: 'app/utils',
      types: 'app/types'
    };

    const dir = typeDirectories[type];
    if (!dir || !fs.existsSync(dir)) {
      return [];
    }

    return fs.readdirSync(dir)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
      .map(file => `${dir}/${file}`);
  }

  // Получение статистики файлов
  getFileStats() {
    const stats = {
      total: 0,
      byType: {},
      largest: null,
      smallest: null
    };

    this.directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir)
          .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));
        
        const type = dir.split('/').pop();
        stats.byType[type] = files.length;
        stats.total += files.length;

        // Находим самый большой и маленький файл
        files.forEach(file => {
          const filePath = `${dir}/${file}`;
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            const size = content.split('\n').length;
            
            if (!stats.largest || size > stats.largest.size) {
              stats.largest = { file: filePath, size };
            }
            if (!stats.smallest || size < stats.smallest.size) {
              stats.smallest = { file: filePath, size };
            }
          } catch (error) {
            console.warn(`⚠️ Не удалось прочитать файл: ${filePath}`);
          }
        });
      }
    });

    return stats;
  }

  // Проверка существования файла
  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  // Получение размера файла
  getFileSize(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n').length;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = FileScannerModule;
