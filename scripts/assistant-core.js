const fs = require('fs');

class AssistantCore {
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

  // Генерация отчета
  generateReport() {
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

    const reportPath = `reports/smart-assistant-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Умный отчет сохранен: ${reportPath}`);
    
    return this;
  }
}

module.exports = AssistantCore;
