#!/usr/bin/env node

/**
 * QA Corridor Check
 * Проверяет что изменения соответствуют CORRIDOR режиму
 */

const fs = require('fs');
const path = require('path');

// Запрещенные файлы/паттерны
const FORBIDDEN_PATTERNS = [
  'app/components/reactions/**',
  'app/hooks/useReactionState.ts',
  'ReactionBar.tsx',
  'gestures/**',
  'useSelection.ts',
  'MessageList.tsx',
  'MessageBubble.tsx',
  'scripts/qa/**'
];

// Проверяем allowlist
function checkAllowlist() {
  const allowlistPath = path.join(process.cwd(), 'qa-allowlist.json');
  
  if (!fs.existsSync(allowlistPath)) {
    console.error('❌ qa-allowlist.json not found');
    return false;
  }
  
  const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
  
  if (!allowlist.allowed_files || !Array.isArray(allowlist.allowed_files)) {
    console.error('❌ qa-allowlist.json invalid format');
    return false;
  }
  
  console.log('✅ allowlist format OK');
  console.log(`📝 Allowed files: ${allowlist.allowed_files.join(', ')}`);
  
  return true;
}

// Проверяем дубликаты
function checkDuplicates() {
  // Проверяем что селекция не дублируется
  const chatCorePath = path.join(process.cwd(), 'app/components/ChatCore.tsx');
  const selectionToolbarPath = path.join(process.cwd(), 'app/components/chat/SelectionToolbar.tsx');
  
  if (!fs.existsSync(selectionToolbarPath)) {
    console.error('❌ SelectionToolbar.tsx not found');
    return false;
  }
  
  const chatCoreContent = fs.readFileSync(chatCorePath, 'utf8');
  
  // Проверяем что Selection UI блок удален из ChatCore
  if (chatCoreContent.includes('selectionHeader') && chatCoreContent.includes('backButton')) {
    console.error('❌ Selection UI still exists in ChatCore.tsx');
    return false;
  }
  
  console.log('✅ No duplicates found');
  return true;
}

function main() {
  console.log('🔍 QA Corridor Check\n');
  
  let success = true;
  
  success &= checkAllowlist();
  success &= checkDuplicates();
  
  if (success) {
    console.log('\n✅ QA Corridor: PASS');
    process.exit(0);
  } else {
    console.log('\n❌ QA Corridor: FAIL');
    process.exit(1);
  }
}

main();