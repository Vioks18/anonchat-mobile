const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class LiveMonitor {
  constructor() {
    this.watcher = null;
    this.changes = [];
    this.issues = [];
    this.lastCheck = Date.now();
  }

  // Запуск мониторинга
  start() {
    console.log('🔍 Запуск Live Monitor...');
    
    this.watcher = chokidar.watch([
      'app/**/*.tsx',
      'app/**/*.ts',
      'app/**/*.js',
      'app.config.js'
    ], {
      ignored: /node_modules/,
      persistent: true
    });

    this.watcher
      .on('add', path => this.onFileChange('add', path))
      .on('change', path => this.onFileChange('change', path))
      .on('unlink', path => this.onFileChange('delete', path))
      .on('error', error => this.onError(error));

    console.log('✅ Live Monitor запущен');
    return this;
  }

  // Обработка изменений файлов
  onFileChange(type, filePath) {
    const timestamp = new Date().toISOString();
    const change = { type, filePath, timestamp };
    
    this.changes.push(change);
    console.log(`📝 ${type}: ${filePath}`);

    // Анализ изменений
    if (type === 'change') {
      this.analyzeFileChange(filePath);
    }

    // Ограничение истории изменений
    if (this.changes.length > 100) {
      this.changes = this.changes.slice(-50);
    }
  }

  // Анализ изменений в файле
  analyzeFileChange(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Проверка на потенциальные проблемы
      this.checkForIssues(filePath, content);
      
      // Проверка производительности
      this.checkPerformance(filePath, content);
      
      // Проверка архитектуры
      this.checkArchitecture(filePath, content);

    } catch (error) {
      console.error(`❌ Ошибка анализа ${filePath}:`, error.message);
    }
  }

  // Проверка на проблемы
  checkForIssues(filePath, content) {
    // Проверка зацикливаний
    if (content.includes('useEffect') && content.includes('setState')) {
      const useEffectCount = (content.match(/useEffect/g) || []).length;
      const setStateCount = (content.match(/setState/g) || []).length;
      
      if (setStateCount > useEffectCount * 3) {
        this.addIssue(filePath, '⚠️ Возможное зацикливание - много setState в useEffect');
      }
    }

    // Проверка неиспользуемых импортов
    const imports = content.match(/import.*from.*['"]([^'"]+)['"]/g);
    if (imports) {
      imports.forEach(imp => {
        const match = imp.match(/import\s+{?\s*([^}]+)\s*}?\s+from/);
        if (match) {
          const importedItems = match[1].split(',').map(item => item.trim());
          importedItems.forEach(item => {
            if (!content.includes(item) && !item.includes('*') && !item.includes('React')) {
              this.addIssue(filePath, `🚫 Неиспользуемый импорт: ${item}`);
            }
          });
        }
      });
    }

    // Проверка console.log в продакшене
    if (content.includes('console.log')) {
      this.addIssue(filePath, '📝 console.log найден - убрать для продакшена');
    }
  }

  // Проверка производительности
  checkPerformance(filePath, content) {
    // Проверка FlatList оптимизации
    if (content.includes('FlatList')) {
      const hasRemoveClippedSubviews = content.includes('removeClippedSubviews');
      const hasMaxToRenderPerBatch = content.includes('maxToRenderPerBatch');
      
      if (!hasRemoveClippedSubviews) {
        this.addSuggestion(filePath, '🚀 Добавить removeClippedSubviews для FlatList');
      }
      if (!hasMaxToRenderPerBatch) {
        this.addSuggestion(filePath, '🚀 Добавить maxToRenderPerBatch для FlatList');
      }
    }

    // Проверка useCallback/useMemo
    if (content.includes('function') && !content.includes('useCallback')) {
      this.addSuggestion(filePath, '🧠 Рассмотреть useCallback для функций');
    }
  }

  // Проверка архитектуры
  checkArchitecture(filePath, content) {
    // Проверка типизации
    if (filePath.endsWith('.tsx') && !content.includes('interface') && !content.includes('type')) {
      this.addSuggestion(filePath, '📝 Добавить типизацию для компонента');
    }

    // Проверка обработки ошибок
    if (content.includes('useState') && !content.includes('try') && !content.includes('catch')) {
      this.addSuggestion(filePath, '🛡️ Добавить обработку ошибок');
    }
  }

  // Добавление проблемы
  addIssue(filePath, message) {
    const issue = { filePath, message, timestamp: Date.now() };
    this.issues.push(issue);
    console.log(`🐛 ${message} в ${filePath}`);
  }

  // Добавление предложения
  addSuggestion(filePath, message) {
    console.log(`💡 ${message} в ${filePath}`);
  }

  // Обработка ошибок
  onError(error) {
    console.error('❌ Ошибка мониторинга:', error);
  }

  // Получение статистики
  getStats() {
    return {
      changes: this.changes.length,
      issues: this.issues.length,
      lastCheck: this.lastCheck,
      uptime: Date.now() - this.lastCheck
    };
  }

  // Остановка мониторинга
  stop() {
    if (this.watcher) {
      this.watcher.close();
      console.log('🛑 Live Monitor остановлен');
    }
  }

  // Генерация отчета
  generateReport() {
    console.log('\n📊 ОТЧЕТ LIVE MONITOR');
    console.log('='.repeat(40));
    
    const stats = this.getStats();
    console.log(`⏱️  Время работы: ${Math.round(stats.uptime / 1000)}с`);
    console.log(`📝 Изменений: ${stats.changes}`);
    console.log(`🐛 Проблем: ${stats.issues}`);
    
    if (this.issues.length > 0) {
      console.log('\n🐛 НАЙДЕННЫЕ ПРОБЛЕМЫ:');
      this.issues.slice(-10).forEach(issue => {
        console.log(`  ${issue.message} в ${issue.filePath}`);
      });
    }
  }
}

// Экспорт
module.exports = LiveMonitor;

// Если запущен напрямую
if (require.main === module) {
  const monitor = new LiveMonitor();
  monitor.start();
  
  // Остановка по Ctrl+C
  process.on('SIGINT', () => {
    monitor.generateReport();
    monitor.stop();
    process.exit();
  });
} 