#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      const trimmed = answer.trim();
      if (!trimmed) {
        console.log('⚠️  Имя фичи не может быть пустым, попробуйте снова');
        rl.question(question, (retryAnswer) => {
          resolve(retryAnswer.trim());
        });
      } else {
        resolve(trimmed);
      }
    });
  });
}

async function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} завершено`);
  } catch (error) {
    console.error(`❌ Ошибка при ${description}:`, error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Запуск prefeature - подготовка к новой фиче\n');
  
  // 1. Запускаем QA
  await runCommand('npm run qa', 'Запуск QA-ассистента');
  
  // 2. Спрашиваем имя фичи
  const featureName = await askQuestion('📝 Введите имя фичи (например: message-animations): ');
  
  if (!featureName) {
    console.error('❌ Имя фичи не может быть пустым');
    process.exit(1);
  }
  
  // Очищаем имя фичи от спецсимволов
  const cleanFeatureName = featureName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  const branchName = `feature/${cleanFeatureName}`;
  
  console.log(`\n📋 Создаем ветку: ${branchName}\n`);
  
  // 3. Создаем новую ветку
  await runCommand(`git checkout -b ${branchName}`, 'Создание новой ветки');
  
  // 4. Добавляем все изменения
  await runCommand('git add -A', 'Добавление всех изменений');
  
  // 5. Делаем коммит
  const commitMessage = `chore: snapshot before ${cleanFeatureName}`;
  await runCommand(`git commit -m "${commitMessage}"`, 'Создание коммита');
  
  // 6. Пушим ветку
  await runCommand(`git push origin ${branchName}`, 'Отправка ветки на GitHub');
  
  console.log('\n🎉 prefeature завершен успешно!');
  console.log(`📁 Ветка: ${branchName}`);
  console.log(`🔗 Готова к разработке фичи: ${featureName}`);
  
  rl.close();
}

main().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
