const fs = require('fs');
const path = require('path');

class SmartAssistant {
  constructor() {
    this.analysis = {
      issues: [],
      suggestions: [],
      architecture: {},
      performance: {},
      security: {},
      bestPractices: []
    };
  }

  // Умный анализ проблем
  analyzeIssues() {
    console.log('🔍 Умный анализ проблем...');
    
    const files = this.getProjectFiles();
    
    files.forEach(filePath => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        this.analyzeFile(filePath);
      }
    });

    return this;
  }

  // Анализ конкретного файла
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Анализ зацикливаний (более умный)
      this.analyzeInfiniteLoops(filePath, content);
      
      // Анализ производительности
      this.analyzePerformance(filePath, content);
      
      // Анализ архитектуры
      this.analyzeArchitecture(filePath, content);
      
      // Анализ безопасности
      this.analyzeSecurity(filePath, content);
      
      // Анализ лучших практик
      this.analyzeBestPractices(filePath, content);

    } catch (error) {
      this.addIssue(filePath, `❌ Ошибка чтения файла: ${error.message}`);
    }
  }

  // Умный анализ зацикливаний
  analyzeInfiniteLoops(filePath, content) {
    // Ищем паттерны зацикливаний
    const useEffectPatterns = content.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[([^\]]*)\]\s*\)/g);
    
    if (useEffectPatterns) {
      useEffectPatterns.forEach(pattern => {
        // Проверяем зависимости
        const depsMatch = pattern.match(/,\s*\[([^\]]*)\]/);
        if (depsMatch) {
          const deps = depsMatch[1].split(',').map(d => d.trim());
          
          // Проверяем подозрительные зависимости
          if (deps.some(dep => dep.includes('setState') || dep.includes('state'))) {
            this.addIssue(filePath, `⚠️ Подозрительная зависимость в useEffect: ${deps.join(', ')}`);
          }
        }
      });
    }
  }

  // Анализ производительности
  analyzePerformance(filePath, content) {
    try {
      // Проверка FlatList оптимизации (только в компонентах, не в хуках)
      if (content.includes('FlatList') && !filePath.includes('/hooks/')) {
        const hasRemoveClippedSubviews = content.includes('removeClippedSubviews');
        const hasMaxToRenderPerBatch = content.includes('maxToRenderPerBatch');
        const hasWindowSize = content.includes('windowSize');
        
        if (!hasRemoveClippedSubviews) {
          this.addSuggestion(filePath, '🚀 Добавить removeClippedSubviews для оптимизации памяти');
        }
        if (!hasMaxToRenderPerBatch) {
          this.addSuggestion(filePath, '🚀 Добавить maxToRenderPerBatch для контроля рендера');
        }
        if (!hasWindowSize) {
          this.addSuggestion(filePath, '🚀 Добавить windowSize для оптимизации скролла');
        }
      }

      // Проверка useMemo только для явно дорогих операций
      const hasExpensiveOperations = content.includes('filter(') && content.includes('=>') ||
                                   content.includes('map(') && content.includes('=>') ||
                                   content.includes('reduce(') && content.includes('=>');
      
      if (hasExpensiveOperations && !content.includes('useMemo')) {
        this.addSuggestion(filePath, '🧠 Рассмотреть useMemo для сложных операций');
      }

    } catch (error) {
      console.error('Ошибка анализа производительности:', error);
    }
  }

  // Анализ архитектуры
  analyzeArchitecture(filePath, content) {
    try {
      // Умная проверка размера файлов (только для очень больших)
      if (!filePath.includes('.backup')) {
        const lines = content.split('\n');
        const codeLines = lines.filter(line => 
          line.trim().length > 0 && 
          !line.trim().startsWith('//') && 
          !line.trim().startsWith('/*')
        ).length;
        
        if (codeLines > 400) {
          this.addSuggestion(filePath, '🏗️ Файл очень большой, рассмотреть разделение');
        }
      }

      // Проверка критически важных проблем
      if (content.includes('useEffect') && !content.includes('try {') && !content.includes('} catch')) {
        this.addSuggestion(filePath, '🛡️ Добавить обработку ошибок в useEffect');
      }

    } catch (error) {
      console.error('Ошибка анализа архитектуры:', error);
    }
  }

  // Умный анализ безопасности
  analyzeSecurity(filePath, content) {
    try {
      // Проверка валидации (умная - учитываем уже добавленную)
      const hasValidation = content.includes('validateMessage') || 
                          content.includes('validateInput') || 
                          content.includes('trim()') ||
                          content.includes('length > 0') ||
                          content.includes('typeof') ||
                          content.includes('includes(');
      
      if (content.includes('TextInput') || content.includes('input')) {
        if (!hasValidation) {
          this.addSuggestion(filePath, '🔒 Добавить валидацию пользовательского ввода');
        }
      }

      // Проверка обработки ошибок
      const hasErrorHandling = content.includes('try {') && content.includes('} catch');
      if (!hasErrorHandling && (content.includes('useEffect') || content.includes('useCallback'))) {
        this.addSuggestion(filePath, '🛡️ Добавить обработку ошибок');
      }

      // Проверка безопасных операций
      if (content.includes('setState') && !content.includes('safeExecute')) {
        this.addSuggestion(filePath, '🛡️ Использовать безопасные операции setState');
      }

    } catch (error) {
      console.error('Ошибка анализа безопасности:', error);
    }
  }

  // Анализ лучших практик
  analyzeBestPractices(filePath, content) {
    try {
      // Умная проверка console.log - игнорируем закомментированные
      const consoleLogPatterns = content.match(/console\.log\s*\([^)]*\)/g);
      if (consoleLogPatterns) {
        consoleLogPatterns.forEach(log => {
          // Проверяем, не закомментирован ли лог
          const lines = content.split('\n');
          const logLine = lines.find(line => line.includes(log));
          if (logLine && !logLine.trim().startsWith('//') && !logLine.trim().startsWith('/*')) {
            this.addSuggestion(filePath, `🔒 Убрать console.log для продакшена: ${log.trim()}`);
          }
        });
      }

      // Проверка размера компонентов (только для очень больших файлов)
      const lines = content.split('\n');
      const codeLines = lines.filter(line => 
        line.trim().length > 0 && 
        !line.trim().startsWith('//') && 
        !line.trim().startsWith('/*')
      ).length;
      
      if (codeLines > 400 && !filePath.includes('.backup')) {
        this.addSuggestion(filePath, '🏗️ Файл очень большой, рассмотреть разделение');
      }

      // Проверка useMemo только для явно дорогих операций
      const hasExpensiveOperations = content.includes('filter(') && content.includes('=>') ||
                                   content.includes('map(') && content.includes('=>') ||
                                   content.includes('reduce(') && content.includes('=>');
      
      if (hasExpensiveOperations && !content.includes('useMemo')) {
        this.addSuggestion(filePath, '🧠 Рассмотреть useMemo для сложных операций');
      }

    } catch (error) {
      console.error('Ошибка анализа лучших практик:', error);
    }
  }

  // Получение файлов проекта
  getProjectFiles() {
    const directories = [
      'app/components',
      'app/hooks', 
      'app/screens',
      'app/providers',
      'app/context',
      'app/utils',
      'app/types'
    ];

    const files = [];
    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        const dirFiles = fs.readdirSync(dir);
        files.push(...dirFiles.map(file => `${dir}/${file}`));
      }
    });

    return files;
  }

  // Добавление проблемы
  addIssue(filePath, message) {
    this.analysis.issues.push({
      file: filePath,
      message,
      type: 'error',
      timestamp: new Date().toISOString()
    });
  }

  // Добавление предложения
  addSuggestion(filePath, message) {
    this.analysis.suggestions.push({
      file: filePath,
      message,
      type: 'suggestion',
      timestamp: new Date().toISOString()
    });
  }

  // Генерация умного отчета
  generateSmartReport() {
    console.log('\n🧠 УМНЫЙ ОТЧЕТ АССИСТЕНТА');
    console.log('='.repeat(50));
    
    console.log('\n🐛 КРИТИЧЕСКИЕ ПРОБЛЕМЫ:');
    const criticalIssues = this.analysis.issues.filter(issue => 
      issue.message.includes('зацикливание') || 
      issue.message.includes('ошибка')
    );
    
    if (criticalIssues.length === 0) {
      console.log('  ✅ Критических проблем не найдено');
    } else {
      criticalIssues.forEach(issue => {
        console.log(`  🔴 ${issue.message} в ${issue.file}`);
      });
    }

    console.log('\n💡 ПРЕДЛОЖЕНИЯ ПО УЛУЧШЕНИЮ:');
    if (this.analysis.suggestions.length === 0) {
      console.log('  ✅ Предложений нет');
    } else {
      this.analysis.suggestions.forEach(suggestion => {
        console.log(`  💡 ${suggestion.message} в ${suggestion.file}`);
      });
    }

    console.log('\n📊 СТАТИСТИКА:');
    console.log(`  📁 Файлов проанализировано: ${this.getProjectFiles().length}`);
    console.log(`  🐛 Проблем найдено: ${this.analysis.issues.length}`);
    console.log(`  💡 Предложений: ${this.analysis.suggestions.length}`);

    return this;
  }

  // Сохранение отчета
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      analysis: this.analysis
    };

    const reportPath = `smart-assistant-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Умный отчет сохранен: ${reportPath}`);
    
    return this;
  }
}

// Экспорт
module.exports = SmartAssistant;

// Если запущен напрямую
if (require.main === module) {
  const assistant = new SmartAssistant();
  assistant
    .analyzeIssues()
    .generateSmartReport()
    .saveReport();
} 