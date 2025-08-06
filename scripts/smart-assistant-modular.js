// Умный ассистент с модульной архитектурой
const AnalyzerModule = require('./modules/analyzer-module');
const ReporterModule = require('./modules/reporter-module');
const FileScannerModule = require('./modules/file-scanner-module');

class SmartAssistantModular {
  constructor() {
    this.analyzer = new AnalyzerModule();
    this.reporter = new ReporterModule();
    this.scanner = new FileScannerModule();
  }

  // Основной метод анализа
  analyze() {
    console.log('🔍 Умный анализ проблем...');
    
    const files = this.scanner.getProjectFiles();
    const results = files.map(file => this.analyzer.analyzeFile(file));
    
    const report = this.reporter.generateReport(results);
    this.reporter.saveReport(report);
    
    return report;
  }

  // Анализ конкретного файла
  analyzeFile(filePath) {
    return this.analyzer.analyzeFile(filePath);
  }

  // Получение статистики
  getStats() {
    return this.scanner.getFileStats();
  }
}

// Если запущен напрямую
if (require.main === module) {
  const assistant = new SmartAssistantModular();
  assistant.analyze();
}

module.exports = SmartAssistantModular;
