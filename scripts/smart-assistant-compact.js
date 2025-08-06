const fs = require('fs');
const AssistantCore = require('./assistant-core');
const { 
  analyzeInfiniteLoops, 
  analyzePerformance, 
  analyzeArchitecture, 
  analyzeSecurity, 
  analyzeBestPractices 
} = require('./assistant-analyzers');

class SmartAssistantCompact extends AssistantCore {
  constructor() {
    super();
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
      
      // Запускаем все анализаторы
      analyzeInfiniteLoops(filePath, content, this);
      analyzePerformance(filePath, content, this);
      analyzeArchitecture(filePath, content, this);
      analyzeSecurity(filePath, content, this);
      analyzeBestPractices(filePath, content, this);

    } catch (error) {
      this.addIssue(filePath, `❌ Ошибка чтения файла: ${error.message}`);
    }
  }
}

// Если запущен напрямую
if (require.main === module) {
  const assistant = new SmartAssistantCompact();
  assistant
    .analyzeIssues()
    .generateReport()
    .saveReport();
}
