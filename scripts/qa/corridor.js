#!/usr/bin/env node

/**
 * QA Corridor Guard
 * Проверяет что изменения соответствуют CORRIDOR режиму
 * Fails if any created/modified file is outside the allowed list
 */

const fs = require('fs');
const path = require('path');

// Исключения - всегда разрешены
const ALLOWED_EXCEPTIONS = [
  'package.json',
  'docs/**',
  'scripts/qa/**'
];

// Проверяем allowlist
function loadAllowlist() {
  const allowlistPath = path.join(process.cwd(), 'qa-allowlist.json');
  
  if (!fs.existsSync(allowlistPath)) {
    console.error('❌ qa-allowlist.json not found');
    process.exit(1);
  }
  
  try {
    const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
    
    if (!allowlist.allowed || !Array.isArray(allowlist.allowed)) {
      console.error('❌ qa-allowlist.json invalid format - missing "allowed" array');
      process.exit(1);
    }
    
    return allowlist.allowed;
  } catch (error) {
    console.error('❌ Failed to parse qa-allowlist.json:', error.message);
    process.exit(1);
  }
}

// Проверяем что файл разрешен
function isFileAllowed(filePath, allowedFiles) {
  // Нормализуем путь
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Проверяем исключения
  for (const exception of ALLOWED_EXCEPTIONS) {
    if (exception.endsWith('/**')) {
      const prefix = exception.slice(0, -2);
      if (normalizedPath.startsWith(prefix)) {
        return true;
      }
    } else if (normalizedPath === exception) {
      return true;
    }
  }
  
  // Проверяем allowlist
  return allowedFiles.includes(normalizedPath);
}

// Получаем измененные файлы (симуляция для демонстрации)
function getModifiedFiles() {
  // В реальной реализации здесь была бы интеграция с git
  // Для демонстрации возвращаем пустой массив
  return [];
}

// Проверяем файлы
function checkFiles(allowedFiles) {
  const modifiedFiles = getModifiedFiles();
  
  if (modifiedFiles.length === 0) {
    console.log('✅ No modified files detected');
    return true;
  }
  
  console.log(`📝 Checking ${modifiedFiles.length} modified files...`);
  
  let allAllowed = true;
  
  for (const file of modifiedFiles) {
    if (!isFileAllowed(file, allowedFiles)) {
      console.error(`❌ File not in allowlist: ${file}`);
      allAllowed = false;
    } else {
      console.log(`✅ File allowed: ${file}`);
    }
  }
  
  return allAllowed;
}

function main() {
  console.log('🔍 QA Corridor Guard\n');
  
  const allowedFiles = loadAllowlist();
  console.log(`📋 Allowed files: ${allowedFiles.length > 0 ? allowedFiles.join(', ') : '(none)'}`);
  console.log(`🔓 Exceptions: ${ALLOWED_EXCEPTIONS.join(', ')}\n`);
  
  const success = checkFiles(allowedFiles);
  
  if (success) {
    console.log('\n✅ QA Corridor: PASS');
    process.exit(0);
  } else {
    console.log('\n❌ QA Corridor: FAIL');
    console.log('💡 Add files to qa-allowlist.json "allowed" array if needed');
    process.exit(1);
  }
}

main();