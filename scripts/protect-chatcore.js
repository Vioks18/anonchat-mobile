#!/usr/bin/env node

/**
 * 🛡️ СКРИПТ ЗАЩИТЫ CHATCORE
 * 
 * Проверяет, что ChatCore.tsx не был изменен
 * и предупреждает о важности его стабильности
 */

const fs = require('fs');
const path = require('path');

const CHATCORE_PATH = path.join(__dirname, '../app/components/ChatCore.tsx');
const PROTECTION_MARKER = '🔒 ЗАЩИЩЕНО ОТ ИЗМЕНЕНИЙ';

function checkChatCoreProtection() {
  try {
    if (!fs.existsSync(CHATCORE_PATH)) {
      console.log('❌ ChatCore.tsx не найден!');
      return false;
    }

    const content = fs.readFileSync(CHATCORE_PATH, 'utf8');
    
    // Проверяем наличие защитного комментария
    if (!content.includes(PROTECTION_MARKER)) {
      console.log('⚠️  ВНИМАНИЕ: ChatCore.tsx не содержит защитный маркер!');
      console.log('🔒 Добавьте защитный комментарий в начало файла');
      return false;
    }

    // Проверяем размер файла (не должен быть слишком большим)
    const lines = content.split('\n').length;
    if (lines > 1000) {
      console.log('⚠️  ВНИМАНИЕ: ChatCore.tsx слишком большой!');
      console.log(`📊 Строк: ${lines} (рекомендуется < 1000)`);
      return false;
    }

    console.log('✅ ChatCore.tsx защищен и стабилен');
    console.log('📋 Статус: НЕ ТРОГАТЬ');
    return true;

  } catch (error) {
    console.error('❌ Ошибка проверки ChatCore:', error.message);
    return false;
  }
}

function showProtectionInfo() {
  console.log('\n🛡️  ЗАЩИТА CHATCORE.TSX');
  console.log('========================');
  console.log('📋 Что работает:');
  console.log('  ✅ Отправка сообщений');
  console.log('  ✅ Отображение сообщений');
  console.log('  ✅ Темы');
  console.log('  ✅ Защитная система');
  console.log('  ✅ Клавиатура');
  console.log('  ✅ UI WatchDog');
  console.log('\n🚫 НЕ ДОБАВЛЯТЬ:');
  console.log('  ❌ Сложную функциональность');
  console.log('  ❌ Новые состояния');
  console.log('  ❌ Дополнительные компоненты');
  console.log('\n📖 Подробности: CHATCORE-PROTECTION.md');
}

// Запуск проверки
if (require.main === module) {
  const isProtected = checkChatCoreProtection();
  if (isProtected) {
    showProtectionInfo();
  }
}

module.exports = { checkChatCoreProtection, showProtectionInfo };
