// Модуль анализатора - отдельный файл
const fs = require('fs');

class AnalyzerModule {
  constructor() {
    this.results = [];
  }

  // Анализ файла
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      const analysis = {
        file: filePath,
        issues: [],
        suggestions: [],
        size: content.split('\n').length
      };

      // Проверки
      this.checkSize(analysis, content);
      this.checkSecurity(analysis, content);
      this.checkPerformance(analysis, content);
      this.checkBestPractices(analysis, content);

      return analysis;
    } catch (error) {
      return {
        file: filePath,
        error: error.message,
        issues: [],
        suggestions: []
      };
    }
  }

  // Проверка размера
  checkSize(analysis, content) {
    const lines = content.split('\n').filter(line => 
      line.trim().length > 0 && 
      !line.trim().startsWith('//') && 
      !line.trim().startsWith('/*')
    ).length;
    
    if (lines > 400) {
      analysis.suggestions.push('🏗️ Файл очень большой, рассмотреть разделение');
    }
  }

  // Проверка безопасности
  checkSecurity(analysis, content) {
    const hasValidation = content.includes('validateMessage') || 
                        content.includes('trim()') ||
                        content.includes('typeof');
    
    if ((content.includes('TextInput') || content.includes('input')) && !hasValidation) {
      if (!analysis.file.includes('ChatSearch') && !analysis.file.includes('DevHUD')) {
        analysis.suggestions.push('🔒 Добавить валидацию пользовательского ввода');
      }
    }

    const hasErrorHandling = content.includes('try {') && content.includes('} catch');
    if (!hasErrorHandling && (content.includes('useEffect') || content.includes('useCallback'))) {
      if (!analysis.file.includes('FakeSocketProvider') && !analysis.file.includes('UIErrorBoundary')) {
        analysis.suggestions.push('🛡️ Добавить обработку ошибок');
      }
    }
  }

  // Проверка производительности
  checkPerformance(analysis, content) {
    if (content.includes('FlatList') && !analysis.file.includes('/hooks/')) {
      if (!content.includes('removeClippedSubviews')) {
        analysis.suggestions.push('🚀 Добавить removeClippedSubviews');
      }
    }

    const hasExpensiveOperations = content.includes('filter(') && content.includes('=>') ||
                                 content.includes('map(') && content.includes('=>');
    
    if (hasExpensiveOperations && !content.includes('useMemo')) {
      analysis.suggestions.push('🧠 Рассмотреть useMemo для сложных операций');
    }
  }

  // Проверка лучших практик
  checkBestPractices(analysis, content) {
    const consoleLogPatterns = content.match(/console\.log\s*\([^)]*\)/g);
    if (consoleLogPatterns) {
      consoleLogPatterns.forEach(log => {
        const lines = content.split('\n');
        const logLine = lines.find(line => line.includes(log));
        if (logLine && !logLine.trim().startsWith('//')) {
          analysis.suggestions.push(`🔒 Убрать console.log: ${log.trim()}`);
        }
      });
    }
  }
}

module.exports = AnalyzerModule;
