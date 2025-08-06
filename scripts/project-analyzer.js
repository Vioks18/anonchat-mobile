const fs = require('fs');
const path = require('path');

class ProjectAnalyzer {
  constructor() {
    this.analysis = {
      files: [],
      imports: {},
      dependencies: {},
      issues: [],
      suggestions: [],
      performance: {},
      architecture: {}
    };
  }

  // Анализ структуры проекта
  analyzeStructure() {
    console.log('🔍 Анализ структуры проекта...');
    
    const directories = [
      'app/components',
      'app/hooks', 
      'app/screens',
      'app/providers',
      'app/context',
      'app/utils',
      'app/types'
    ];

    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        this.analysis.files.push(...files.map(file => `${dir}/${file}`));
      }
    });

    console.log(`📁 Найдено файлов: ${this.analysis.files.length}`);
    return this;
  }

  // Анализ импортов и зависимостей
  analyzeImports() {
    console.log('📦 Анализ импортов...');
    
    this.analysis.files.forEach(filePath => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const imports = content.match(/import.*from.*['"]([^'"]+)['"]/g);
          
          if (imports) {
            this.analysis.imports[filePath] = imports.map(imp => {
              const match = imp.match(/from.*['"]([^'"]+)['"]/);
              return match ? match[1] : imp;
            });
          }
        } catch (error) {
          this.analysis.issues.push(`❌ Ошибка чтения ${filePath}: ${error.message}`);
        }
      }
    });

    return this;
  }

  // Поиск потенциальных проблем
  findIssues() {
    console.log('🐛 Поиск проблем...');
    
    this.analysis.files.forEach(filePath => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Поиск зацикливаний
          if (content.includes('useEffect') && content.includes('setState')) {
            const useEffectCount = (content.match(/useEffect/g) || []).length;
            const setStateCount = (content.match(/setState/g) || []).length;
            
            if (useEffectCount > 0 && setStateCount > useEffectCount * 2) {
              this.analysis.issues.push(`⚠️ Возможное зацикливание в ${filePath}`);
            }
          }

          // Поиск неиспользуемых импортов
          const imports = content.match(/import.*from.*['"]([^'"]+)['"]/g);
          if (imports) {
            imports.forEach(imp => {
              const match = imp.match(/import\s+{?\s*([^}]+)\s*}?\s+from/);
              if (match) {
                const importedItems = match[1].split(',').map(item => item.trim());
                importedItems.forEach(item => {
                  if (!content.includes(item) && !item.includes('*')) {
                    this.analysis.issues.push(`🚫 Неиспользуемый импорт ${item} в ${filePath}`);
                  }
                });
              }
            });
          }

          // Поиск console.log в продакшене
          if (content.includes('console.log')) {
            this.analysis.issues.push(`📝 console.log найден в ${filePath}`);
          }

        } catch (error) {
          this.analysis.issues.push(`❌ Ошибка анализа ${filePath}: ${error.message}`);
        }
      }
    });

    return this;
  }

  // Анализ производительности
  analyzePerformance() {
    console.log('⚡ Анализ производительности...');
    
    this.analysis.files.forEach(filePath => {
      if (filePath.includes('ChatCore.tsx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Проверка FlatList оптимизации
          if (content.includes('FlatList')) {
            const hasRemoveClippedSubviews = content.includes('removeClippedSubviews');
            const hasMaxToRenderPerBatch = content.includes('maxToRenderPerBatch');
            
            if (!hasRemoveClippedSubviews) {
              this.analysis.suggestions.push('🚀 Добавить removeClippedSubviews для FlatList');
            }
            if (!hasMaxToRenderPerBatch) {
              this.analysis.suggestions.push('🚀 Добавить maxToRenderPerBatch для FlatList');
            }
          }

          // Проверка useCallback/useMemo
          const hasUseCallback = content.includes('useCallback');
          const hasUseMemo = content.includes('useMemo');
          
          if (!hasUseCallback && content.includes('function')) {
            this.analysis.suggestions.push('🧠 Рассмотреть использование useCallback');
          }
          if (!hasUseMemo && content.includes('useState')) {
            this.analysis.suggestions.push('🧠 Рассмотреть использование useMemo');
          }

        } catch (error) {
          this.analysis.issues.push(`❌ Ошибка анализа производительности ${filePath}: ${error.message}`);
        }
      }
    });

    return this;
  }

  // Анализ архитектуры
  analyzeArchitecture() {
    console.log('🏗️ Анализ архитектуры...');
    
    const hasZustand = this.analysis.files.some(file => file.includes('useMessageStore'));
    const hasErrorBoundary = this.analysis.files.some(file => file.includes('ErrorBoundary'));
    const hasWatchDog = this.analysis.files.some(file => file.includes('useUIWatchDog'));
    
    this.analysis.architecture = {
      stateManagement: hasZustand ? 'Zustand ✅' : 'useState ❌',
      errorHandling: hasErrorBoundary ? 'ErrorBoundary ✅' : 'Нет ❌',
      monitoring: hasWatchDog ? 'WatchDog ✅' : 'Нет ❌',
      modularity: this.analysis.files.length > 10 ? 'Модульная ✅' : 'Монолитная ❌'
    };

    return this;
  }

  // Генерация отчета
  generateReport() {
    console.log('\n📊 ОТЧЕТ АНАЛИЗА ПРОЕКТА');
    console.log('='.repeat(50));
    
    console.log('\n📁 СТРУКТУРА:');
    console.log(`Файлов: ${this.analysis.files.length}`);
    this.analysis.files.forEach(file => {
      console.log(`  📄 ${file}`);
    });

    console.log('\n🐛 ПРОБЛЕМЫ:');
    if (this.analysis.issues.length === 0) {
      console.log('  ✅ Проблем не найдено');
    } else {
      this.analysis.issues.forEach(issue => {
        console.log(`  ${issue}`);
      });
    }

    console.log('\n💡 ПРЕДЛОЖЕНИЯ:');
    if (this.analysis.suggestions.length === 0) {
      console.log('  ✅ Предложений нет');
    } else {
      this.analysis.suggestions.forEach(suggestion => {
        console.log(`  ${suggestion}`);
      });
    }

    console.log('\n🏗️ АРХИТЕКТУРА:');
    Object.entries(this.analysis.architecture).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    console.log('\n📦 ЗАВИСИМОСТИ:');
    const uniqueImports = new Set();
    Object.values(this.analysis.imports).flat().forEach(imp => {
      uniqueImports.add(imp);
    });
    Array.from(uniqueImports).forEach(imp => {
      console.log(`  📦 ${imp}`);
    });

    return this;
  }

  // Сохранение отчета в файл
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      analysis: this.analysis
    };

    const reportPath = `analysis-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Отчет сохранен: ${reportPath}`);
    
    return this;
  }
}

// Экспорт для использования
module.exports = ProjectAnalyzer;

// Если запущен напрямую
if (require.main === module) {
  const analyzer = new ProjectAnalyzer();
  analyzer
    .analyzeStructure()
    .analyzeImports()
    .findIssues()
    .analyzePerformance()
    .analyzeArchitecture()
    .generateReport()
    .saveReport();
} 