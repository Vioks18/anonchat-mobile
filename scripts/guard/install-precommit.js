#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Установщик pre-commit hook для AnonChat
function installPreCommitHook() {
  try {
    // Путь к .git/hooks
    const hooksDir = path.join(process.cwd(), '.git', 'hooks');
    const preCommitPath = path.join(hooksDir, 'pre-commit');

    // Создаем папку .git/hooks если её нет
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Bash-скрипт для pre-commit hook
    const bashScript = `#!/usr/bin/env bash
set -e

echo "[GUARD] Running pre-commit checks..."

# Запускаем QA тесты
npm run qa:strict >/dev/null || { 
  echo "[BLOCK] QA tests failed"; 
  exit 1; 
}

# Проверяем что нет P0 ошибок в QA-REPORT.md
if grep -q '❌ P0.*—' QA-REPORT.md; then 
  echo "[BLOCK] Found P0 errors in QA-REPORT.md"; 
  exit 1; 
fi

# Блокируем console.log и debugger в staged diff
if git diff --cached | grep -E 'console\\.log\\(|debugger'; then 
  echo "[BLOCK] Found console.log or debugger in staged changes"; 
  exit 1; 
fi

echo "[OK] Pre-commit checks passed"
`;

    // Записываем bash-скрипт в pre-commit hook
    fs.writeFileSync(preCommitPath, bashScript);

    // Даем права на исполнение (только в Unix)
    if (process.platform !== 'win32') {
      fs.chmodSync(preCommitPath, 0o755);
    }

    console.log('[OK] pre-commit hook installed -> .git/hooks/pre-commit');
    console.log('[INFO] Hook will run QA tests, check for P0 errors, and block console.log/debugger');

  } catch (error) {
    console.error('[ERROR] Failed to install pre-commit hook:', error.message);
    process.exit(1);
  }
}

// Запускаем установку
if (require.main === module) {
  installPreCommitHook();
}

module.exports = { installPreCommitHook };
