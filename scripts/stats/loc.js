#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Конфигурация
const SCAN_DIR = 'app';
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDE_PATTERNS = ['backup', 'mocks', 'node_modules', '.expo', 'android', 'ios', 'dist', 'build'];

// Функция для проверки, нужно ли исключить файл
function shouldExclude(filePath) {
  const normalizedPath = filePath.toLowerCase();
  return EXCLUDE_PATTERNS.some(pattern => normalizedPath.includes(pattern));
}

// Функция для подсчета строк в файле
function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}:`, error.message);
    return 0;
  }
}

// Функция для рекурсивного сканирования директории
function scanDirectory(dirPath, basePath = '') {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = path.join(basePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldExclude(relativePath)) {
          results.push(...scanDirectory(fullPath, relativePath));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (INCLUDE_EXTENSIONS.includes(ext) && !shouldExclude(relativePath)) {
          const loc = countLines(fullPath);
          if (loc > 0) {
            results.push({
              path: relativePath,
              loc
            });
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan ${dirPath}:`, error.message);
  }
  
  return results;
}

// Основная функция
function main() {
  if (!fs.existsSync(SCAN_DIR)) {
    console.error(`Error: Directory '${SCAN_DIR}' not found`);
    process.exit(1);
  }
  
  console.log(`Scanning ${SCAN_DIR}/ for TypeScript/JavaScript files...\n`);
  
  const files = scanDirectory(SCAN_DIR);
  
  if (files.length === 0) {
    console.log('No files found matching criteria.');
    return;
  }
  
  // Сортировка по количеству строк (убывание)
  files.sort((a, b) => b.loc - a.loc);
  
  // Подсчет общего количества строк
  const totalLoc = files.reduce((sum, file) => sum + file.loc, 0);
  
  // Вывод результатов
  console.log(`Total LOC in ${SCAN_DIR}/: ${totalLoc.toLocaleString()}\n`);
  console.log('Top 20 files by LOC:');
  console.log('LOC\t\tPath');
  console.log('---\t\t----');
  
  const top20 = files.slice(0, 20);
  for (const file of top20) {
    console.log(`${file.loc.toString().padStart(8)}\t${file.path}`);
  }
  
  if (files.length > 20) {
    console.log(`\n... and ${files.length - 20} more files`);
  }
  
  // Создание JSON отчета
  const report = {
    totalLoc,
    files,
    generatedAt: new Date().toISOString()
  };
  
  // Создание директории если не существует
  const reportDir = path.dirname('qa/loc-report.json');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync('qa/loc-report.json', JSON.stringify(report, null, 2));
  console.log(`\nReport saved to qa/loc-report.json`);
}

// Запуск
if (require.main === module) {
  main();
}

module.exports = { scanDirectory, countLines, shouldExclude };
