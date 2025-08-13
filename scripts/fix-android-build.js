#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Исправление проблем сборки Android...');

try {
  // Очистка кэша Gradle
  console.log('🧹 Очистка кэша Gradle...');
  execSync('cd android && ./gradlew clean', { stdio: 'inherit' });
  
  // Очистка кэша Metro
  console.log('🧹 Очистка кэша Metro...');
  execSync('npx expo start --clear', { stdio: 'inherit' });
  
  // Очистка node_modules (опционально)
  console.log('🧹 Очистка node_modules...');
  execSync('rm -rf node_modules && npm install', { stdio: 'inherit' });
  
  // Пересборка Android
  console.log('🔨 Пересборка Android...');
  execSync('cd android && ./gradlew assembleDebug', { stdio: 'inherit' });
  
  console.log('✅ Сборка завершена успешно!');
  
} catch (error) {
  console.error('❌ Ошибка при сборке:', error.message);
  process.exit(1);
}
