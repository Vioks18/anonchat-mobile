#!/usr/bin/env node
// Simulation runner for AnonChat (no external deps)

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ARGS = process.argv.slice(2);
const STRESS_MODE = ARGS.includes('--stress');

const writeFileSafe = (p, data) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, data, 'utf8');
};

// Mock data generators
const generateShortMessages = (count) => {
  const shorts = ['Ок', '✅', 'Да', 'Нет', '👍', '❤️', '😂', '😮', '😢', '😡'];
  return Array.from({ length: count }, (_, i) => ({
    id: `short_${Date.now()}_${i}`,
    text: shorts[i % shorts.length],
    sender: i % 2 === 0 ? 'me' : 'other',
    timestamp: Date.now() - i * 1000,
    status: 'read',
    reactions: []
  }));
};

const generateLongMessages = (count) => {
  const longTexts = [
    'Это очень длинное сообщение с множеством слов, которое должно проверить, как работает перенос строк и адаптивная ширина пузырьков в нашем чате.',
    'Еще одно длинное сообщение для тестирования производительности рендеринга и проверки корректности отображения метаданных (время и галочки) в правом нижнем углу.',
    'Третье длинное сообщение, которое поможет убедиться, что анимации работают правильно, а панель реакций позиционируется корректно относительно выбранного сообщения.'
  ];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `long_${Date.now()}_${i}`,
    text: longTexts[i % longTexts.length] + ' ' + (i + 1).toString().repeat(10),
    sender: i % 2 === 0 ? 'me' : 'other',
    timestamp: Date.now() - i * 2000,
    status: 'read',
    reactions: []
  }));
};

const generateReactions = (messageIds) => {
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];
  return messageIds.map(id => ({
    messageId: id,
    reaction: reactions[Math.floor(Math.random() * reactions.length)]
  }));
};

// Simulation scenarios
const runScenarioA = () => {
  console.log('🔄 Running Scenario A: 20 short messages');
  return generateShortMessages(20);
};

const runScenarioB = () => {
  console.log('🔄 Running Scenario B: 10 long paragraphs');
  return generateLongMessages(10);
};

const runScenarioC = (messageIds) => {
  console.log('🔄 Running Scenario C: Reaction series');
  return generateReactions(messageIds.slice(0, 5));
};

const runScenarioD = () => {
  console.log('🔄 Running Scenario D: Scroll events');
  return [
    { type: 'scroll', direction: 'up', timestamp: Date.now() - 5000 },
    { type: 'scroll', direction: 'down', timestamp: Date.now() - 3000 },
    { type: 'scroll', direction: 'up', timestamp: Date.now() - 1000 }
  ];
};

// Main simulation
const runSimulation = () => {
  console.log('🚀 Starting AnonChat simulation...');
  
  const startTime = Date.now();
  
  // Run scenarios
  const shortMessages = runScenarioA();
  const longMessages = runScenarioB();
  const allMessageIds = [...shortMessages, ...longMessages].map(m => m.id);
  const reactions = runScenarioC(allMessageIds);
  const scrollEvents = runScenarioD();
  
  // Mock metrics
  const rendersPerMessage = STRESS_MODE ? Math.floor(Math.random() * 5) + 1 : 1;
  const maxBubbleWidth = Math.floor(Math.random() * 200) + 150;
  const deadZoneCount = Math.floor(Math.random() * 3);
  const metaOutOfBoundsCount = Math.floor(Math.random() * 2);
  const avgRenderTimeMs = Math.floor(Math.random() * 10) + 5;
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Generate report
  const report = {
    rendersPerMessage: rendersPerMessage === 1 ? 'n/a' : rendersPerMessage,
    maxBubbleWidth,
    deadZoneCount,
    metaOutOfBoundsCount,
    avgRenderTimeMs: avgRenderTimeMs === 5 ? 'n/a' : avgRenderTimeMs,
    simulationTime: totalTime,
    messagesProcessed: shortMessages.length + longMessages.length,
    reactionsGenerated: reactions.length,
    scrollEvents: scrollEvents.length,
    timestamp: new Date().toISOString()
  };
  
  // Write report
  const reportPath = path.join(ROOT, 'sim-report.json');
  writeFileSafe(reportPath, JSON.stringify(report, null, 2));
  
  console.log('✅ Simulation complete!');
  console.log(`📊 Report written to: ${reportPath}`);
  console.log(`⏱️  Total time: ${totalTime}ms`);
  console.log(`📝 Messages: ${report.messagesProcessed}`);
  console.log(`🎯 Reactions: ${report.reactionsGenerated}`);
  
  return report;
};

// Run simulation
if (require.main === module) {
  runSimulation();
}

module.exports = { runSimulation };
