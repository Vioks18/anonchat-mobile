#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Быстрое исправление Android сборки для Windows...');

try {
  // Очистка Gradle
  console.log('🧹 Очистка Gradle...');
  execSync('cd android && gradlew.bat clean', { stdio: 'inherit', shell: true });
  
  // Удаление папки build (Windows совместимость)
  console.log('🗑️ Удаление папки build...');
  const buildPath = path.join('android', 'app', 'build');
  if (fs.existsSync(buildPath)) {
    execSync(`rmdir /s /q "${buildPath}"`, { stdio: 'inherit', shell: true });
  }
  
  // Пересборка
  console.log('🔨 Пересборка...');
  execSync('cd android && gradlew.bat assembleDebug', { stdio: 'inherit', shell: true });
  
  console.log('✅ Готово!');
  
} catch (error) {
  console.error('❌ Ошибка:', error.message);
  console.log('💡 Попробуйте: npm run fix:android');
}
