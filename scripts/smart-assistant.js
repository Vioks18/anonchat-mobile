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

    // Проверка useCallback/useMemo
    const hasUseCallback = content.includes('useCallback');
    const hasUseMemo = content.includes('useMemo');
    const hasExpensiveOperations = content.includes('filter(') || content.includes('map(') || content.includes('reduce(');
    
    // Проверяем только если есть дорогие операции и нет useMemo
    if (hasExpensiveOperations && !hasUseMemo) {
      // Дополнительная проверка - не предлагаем для простых операций
      const lines = content.split('\n');
      let hasComplexOperation = false;
      
      lines.forEach(line => {
        if (line.includes('filter(') || line.includes('map(') || line.includes('reduce(')) {
          // Проверяем, что это не простой случай
          if (line.length > 50 || line.includes('=>')) {
            hasComplexOperation = true;
          }
        }
      });
      
      if (hasComplexOperation) {
        this.addSuggestion(filePath, '🧠 Рассмотреть useMemo для дорогих операций');
      }
    }
    
    // Проверка useCallback только для функций в зависимостях useEffect
    if (content.includes('useEffect') && content.includes('function') && !hasUseCallback) {
      const useEffectPatterns = content.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[([^\]]*)\]\s*\)/g);
      if (useEffectPatterns && useEffectPatterns.some(pattern => pattern.includes('function'))) {
        this.addSuggestion(filePath, '🧠 Рассмотреть useCallback для функций в зависимостях');
      }
    }
  }

  // Анализ архитектуры
  analyzeArchitecture(filePath, content) {
    // Проверка типизации
    if (filePath.endsWith('.tsx') && content.includes('React.FC')) {
      const hasInterface = content.includes('interface') || content.includes('type');
      if (!hasInterface) {
        this.addSuggestion(filePath, '📝 Добавить типизацию для компонента');
      }
    }

    // Проверка обработки ошибок
    if (content.includes('useState') && !content.includes('try') && !content.includes('catch')) {
      this.addSuggestion(filePath, '🛡️ Добавить обработку ошибок для критических операций');
    }

    // Проверка разделения ответственности
    if (content.length > 500 && content.includes('useState') && content.includes('useEffect')) {
      this.addSuggestion(filePath, '🏗️ Рассмотреть разделение на более мелкие компоненты');
    }
  }

  // Умный анализ безопасности
  analyzeSecurity(filePath, content) {
    // Проверка console.log в продакшене (исключая закомментированные)
    const consoleLogMatches = content.match(/console\.log\(/g);
    if (consoleLogMatches) {
      // Проверяем каждое вхождение console.log
      const lines = content.split('\n');
      let hasUncommentedConsoleLog = false;
      
      lines.forEach((line, index) => {
        if (line.includes('console.log(')) {
          // Проверяем, не закомментирована ли строка
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith('//') && !trimmedLine.startsWith('/*') && !trimmedLine.startsWith('*')) {
            hasUncommentedConsoleLog = true;
          }
        }
      });
      
      if (hasUncommentedConsoleLog) {
        this.addSuggestion(filePath, '🔒 Убрать console.log для продакшена');
      }
    }

    // Проверка валидации данных
    if (content.includes('userInput') || content.includes('onChangeText')) {
      this.addSuggestion(filePath, '🔒 Добавить валидацию пользовательского ввода');
    }
  }

  // Анализ лучших практик
  analyzeBestPractices(filePath, content) {
    // Проверка именования
    const componentMatch = content.match(/export\s+const\s+(\w+)\s*:\s*React\.FC/);
    if (componentMatch) {
      const componentName = componentMatch[1];
      if (!componentName.match(/^[A-Z]/)) {
        this.addSuggestion(filePath, '📝 Компоненты должны начинаться с заглавной буквы');
      }
    }

    // Проверка структуры
    if (content.includes('import') && content.includes('export')) {
      const importCount = (content.match(/import/g) || []).length;
      const exportCount = (content.match(/export/g) || []).length;
      
      if (exportCount > 3) {
        this.addSuggestion(filePath, '📦 Рассмотреть разделение на несколько файлов');
      }
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