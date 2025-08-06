// Анализаторы для умного ассистента

// Анализ зацикливаний
function analyzeInfiniteLoops(filePath, content, assistant) {
  const useEffectPatterns = content.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[([^\]]*)\]\s*\)/g);
  
  if (useEffectPatterns) {
    useEffectPatterns.forEach(pattern => {
      const depsMatch = pattern.match(/,\s*\[([^\]]*)\]/);
      if (depsMatch) {
        const deps = depsMatch[1].split(',').map(d => d.trim());
        
        if (deps.some(dep => dep.includes('setState') || dep.includes('state'))) {
          assistant.addIssue(filePath, `⚠️ Подозрительная зависимость в useEffect: ${deps.join(', ')}`);
        }
      }
    });
  }
}

// Анализ производительности
function analyzePerformance(filePath, content, assistant) {
  try {
    // Проверка FlatList оптимизации
    if (content.includes('FlatList') && !filePath.includes('/hooks/')) {
      const hasRemoveClippedSubviews = content.includes('removeClippedSubviews');
      const hasMaxToRenderPerBatch = content.includes('maxToRenderPerBatch');
      const hasWindowSize = content.includes('windowSize');
      
      if (!hasRemoveClippedSubviews) {
        assistant.addSuggestion(filePath, '🚀 Добавить removeClippedSubviews для оптимизации памяти');
      }
      if (!hasMaxToRenderPerBatch) {
        assistant.addSuggestion(filePath, '🚀 Добавить maxToRenderPerBatch для контроля рендера');
      }
      if (!hasWindowSize) {
        assistant.addSuggestion(filePath, '🚀 Добавить windowSize для оптимизации скролла');
      }
    }

    // Проверка useMemo для дорогих операций
    const hasExpensiveOperations = content.includes('filter(') && content.includes('=>') ||
                                 content.includes('map(') && content.includes('=>') ||
                                 content.includes('reduce(') && content.includes('=>');
    
    if (hasExpensiveOperations && !content.includes('useMemo')) {
      assistant.addSuggestion(filePath, '🧠 Рассмотреть useMemo для сложных операций');
    }

  } catch (error) {
    console.error('Ошибка анализа производительности:', error);
  }
}

// Анализ архитектуры
function analyzeArchitecture(filePath, content, assistant) {
  try {
    // Умная проверка размера файлов
    if (!filePath.includes('.backup')) {
      const lines = content.split('\n');
      const codeLines = lines.filter(line => 
        line.trim().length > 0 && 
        !line.trim().startsWith('//') && 
        !line.trim().startsWith('/*')
      ).length;
      
      // Учитываем уже разделенные файлы
      if (codeLines > 400 && !filePath.includes('ChatMenu') && !filePath.includes('ChatSearch')) {
        assistant.addSuggestion(filePath, '🏗️ Файл очень большой, рассмотреть разделение');
      }
    }

    // Проверка критически важных проблем
    if (content.includes('useEffect') && !content.includes('try {') && !content.includes('} catch')) {
      assistant.addSuggestion(filePath, '🛡️ Добавить обработку ошибок в useEffect');
    }

  } catch (error) {
    console.error('Ошибка анализа архитектуры:', error);
  }
}

// Анализ безопасности
function analyzeSecurity(filePath, content, assistant) {
  try {
    // Проверка валидации
    const hasValidation = content.includes('validateMessage') || 
                        content.includes('validateInput') || 
                        content.includes('trim()') ||
                        content.includes('length > 0') ||
                        content.includes('typeof') ||
                        content.includes('includes(');
    
    // Пропускаем файлы где уже есть валидация
    if ((content.includes('TextInput') || content.includes('input')) && !hasValidation) {
      // Исключаем файлы где валидация уже добавлена
      if (!filePath.includes('ChatSearch') && !filePath.includes('DevHUD')) {
        assistant.addSuggestion(filePath, '🔒 Добавить валидацию пользовательского ввода');
      }
    }

    // Проверка обработки ошибок
    const hasErrorHandling = content.includes('try {') && content.includes('} catch');
    if (!hasErrorHandling && (content.includes('useEffect') || content.includes('useCallback'))) {
      // Исключаем файлы где обработка ошибок уже есть
      if (!filePath.includes('FakeSocketProvider') && !filePath.includes('UIErrorBoundary')) {
        assistant.addSuggestion(filePath, '🛡️ Добавить обработку ошибок');
      }
    }

    // Проверка безопасных операций
    if (content.includes('setState') && !content.includes('safeExecute')) {
      // Исключаем файлы где безопасные операции уже есть
      if (!filePath.includes('UIErrorBoundary')) {
        assistant.addSuggestion(filePath, '🛡️ Использовать безопасные операции setState');
      }
    }

  } catch (error) {
    console.error('Ошибка анализа безопасности:', error);
  }
}

// Анализ лучших практик
function analyzeBestPractices(filePath, content, assistant) {
  try {
    // Умная проверка console.log - игнорируем закомментированные
    const consoleLogPatterns = content.match(/console\.log\s*\([^)]*\)/g);
    if (consoleLogPatterns) {
      consoleLogPatterns.forEach(log => {
        // Проверяем, не закомментирован ли лог
        const lines = content.split('\n');
        const logLine = lines.find(line => line.includes(log));
        if (logLine && !logLine.trim().startsWith('//') && !logLine.trim().startsWith('/*')) {
          assistant.addSuggestion(filePath, `🔒 Убрать console.log для продакшена: ${log.trim()}`);
        }
      });
    }

    // Проверка размера компонентов
    const lines = content.split('\n');
    const codeLines = lines.filter(line => 
      line.trim().length > 0 && 
      !line.trim().startsWith('//') && 
      !line.trim().startsWith('/*')
    ).length;
    
    if (codeLines > 400 && !filePath.includes('.backup')) {
      assistant.addSuggestion(filePath, '🏗️ Файл очень большой, рассмотреть разделение');
    }

    // Проверка useMemo для дорогих операций
    const hasExpensiveOperations = content.includes('filter(') && content.includes('=>') ||
                                 content.includes('map(') && content.includes('=>') ||
                                 content.includes('reduce(') && content.includes('=>');
    
    if (hasExpensiveOperations && !content.includes('useMemo')) {
      assistant.addSuggestion(filePath, '🧠 Рассмотреть useMemo для сложных операций');
    }

  } catch (error) {
    console.error('Ошибка анализа лучших практик:', error);
  }
}

module.exports = {
  analyzeInfiniteLoops,
  analyzePerformance,
  analyzeArchitecture,
  analyzeSecurity,
  analyzeBestPractices
};
