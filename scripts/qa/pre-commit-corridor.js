#!/usr/bin/env node

/**
 * Pre-commit Corridor Guard
 * Проверяет что qa-allowlist.json содержит не больше 1 записи
 */

const fs = require('fs');
const path = require('path');

function checkAllowlistSize() {
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
    
    if (allowlist.allowed.length > 1) {
      console.error('❌ Too many files in allowlist. Corridor guard failed.');
      console.error(`📝 Found ${allowlist.allowed.length} files: ${allowlist.allowed.join(', ')}`);
      console.error('💡 Keep only one file in allowlist during corridor mode');
      process.exit(1);
    }
    
    console.log('✅ Corridor allowlist size OK');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to parse qa-allowlist.json:', error.message);
    process.exit(1);
  }
}

checkAllowlistSize();
