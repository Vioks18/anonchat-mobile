// Модуль репортера - отдельный файл
const fs = require('fs');

class ReporterModule {
  constructor() {
    this.reports = [];
  }

  // Генерация отчета
  generateReport(analysisResults) {
    console.log('\n🧠 УМНЫЙ ОТЧЕТ АССИСТЕНТА');
    console.log('='.repeat(50));
    
    const allIssues = [];
    const allSuggestions = [];
    
    analysisResults.forEach(result => {
      if (result.issues) allIssues.push(...result.issues);
      if (result.suggestions) allSuggestions.push(...result.suggestions);
    });

    // Критические проблемы
    console.log('\n🐛 КРИТИЧЕСКИЕ ПРОБЛЕМЫ:');
    if (allIssues.length === 0) {
      console.log('  ✅ Критических проблем не найдено');
    } else {
      allIssues.forEach(issue => {
        console.log(`  🔴 ${issue}`);
      });
    }

    // Предложения
    console.log('\n💡 ПРЕДЛОЖЕНИЯ ПО УЛУЧШЕНИЮ:');
    if (allSuggestions.length === 0) {
      console.log('  ✅ Предложений нет');
    } else {
      allSuggestions.forEach(suggestion => {
        console.log(`  💡 ${suggestion}`);
      });
    }

    // Статистика
    console.log('\n📊 СТАТИСТИКА:');
    console.log(`  📁 Файлов проанализировано: ${analysisResults.length}`);
    console.log(`  🐛 Проблем найдено: ${allIssues.length}`);
    console.log(`  💡 Предложений: ${allSuggestions.length}`);

    return {
      issues: allIssues,
      suggestions: allSuggestions,
      totalFiles: analysisResults.length
    };
  }

  // Сохранение отчета
  saveReport(reportData) {
    const report = {
      timestamp: new Date().toISOString(),
      ...reportData
    };

    const reportPath = `reports/smart-assistant-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Умный отчет сохранен: ${reportPath}`);
    
    return reportPath;
  }

  // Экспорт в JSON
  exportToJson(data, filename) {
    const filePath = `reports/${filename}.json`;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`📄 Экспорт в JSON: ${filePath}`);
    return filePath;
  }
}

module.exports = ReporterModule;
