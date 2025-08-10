#!/usr/bin/env node
// Simulation runner for AnonChat (no external deps)

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ARGS = process.argv.slice(2);
const STRESS_MODE = ARGS.includes('--stress');
const TAPDIAG_MODE = ARGS.includes('--tapdiag');
const FROM_FILE = ARGS.find(arg => arg.startsWith('--from='))?.split('=')[1];

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

// Tap diagnostics
const runTapDiagnostics = () => {
  console.log('🔍 Running tap diagnostics...');
  
  // Определяем путь к файлу gesture-report.json
  let gestureReportPath;
  if (FROM_FILE) {
    gestureReportPath = FROM_FILE;
  } else {
    // Пытаемся найти gesture-report.json в разных местах
    const possiblePaths = [
      path.join(ROOT, 'gesture-report.json'),
      path.join(ROOT, 'app', 'gesture-report.json'),
      path.join(ROOT, '..', 'gesture-report.json')
    ];
    
    gestureReportPath = possiblePaths.find(p => fs.existsSync(p));
  }
  
  if (!gestureReportPath || !fs.existsSync(gestureReportPath)) {
    console.log('⚠️  No gesture-report.json found. Run the app in DEV mode and perform some gestures first.');
    return { error: 'No gesture data found' };
  }
  
  console.log(`📁 Reading gesture data from: ${gestureReportPath}`);
  
  try {
    const gestureData = JSON.parse(fs.readFileSync(gestureReportPath, 'utf8'));
    
    // Анализируем события
    const doubleTaps = gestureData.filter(e => e.type === 'doubleTap');
    const scrollBegins = gestureData.filter(e => e.type === 'scrollBegin');
    const openReactions = gestureData.filter(e => e.type === 'openReaction');
    
    // Метрики
    const doubleTapWindowMs = 260; // Ожидаемое окно по умолчанию
    let lateSecondTap = 0;
    let duringScroll = 0;
    const openLatencies = [];
    let openTooFar = 0;
    
    // Анализ двойных тапов
    doubleTaps.forEach(tap => {
      // Находим предыдущий тап по тому же сообщению
      const prevTap = gestureData.find(e => 
        e.type === 'press' && 
        e.msgId === tap.msgId && 
        e.t < tap.t
      );
      
      if (prevTap) {
        const timeDiff = tap.t - prevTap.t;
        if (timeDiff > 300) {
          lateSecondTap++;
        }
      }
      
      // Проверяем, был ли скролл незадолго до двойного тапа
      const recentScroll = scrollBegins.find(s => 
        s.t < tap.t && 
        (tap.t - s.t) <= 120
      );
      if (recentScroll) {
        duringScroll++;
      }
    });
    
    // Анализ латентности открытия реакций
    openReactions.forEach(open => {
      const doubleTap = doubleTaps.find(dt => 
        dt.msgId === open.msgId && 
        dt.t < open.t
      );
      
      if (doubleTap) {
        const latency = open.t - doubleTap.t;
        openLatencies.push(latency);
      }
    });
    
    // Анализ расстояния до точки касания
    openReactions.forEach(open => {
      if (open.x !== undefined && open.y !== undefined) {
        // Находим соответствующий doubleTap для получения координат
        const doubleTap = doubleTaps.find(dt => 
          dt.msgId === open.msgId && 
          dt.t < open.t
        );
        
        if (doubleTap && doubleTap.x !== undefined && doubleTap.y !== undefined) {
          const distance = Math.sqrt(
            Math.pow(open.x - doubleTap.x, 2) + 
            Math.pow(open.y - doubleTap.y, 2)
          );
          
          // 96dp ≈ 96px на большинстве устройств
          if (distance > 96) {
            openTooFar++;
          }
        }
      }
    });
    
    // Вычисляем P95 латентности
    const openLatencyP95 = openLatencies.length > 0 
      ? openLatencies.sort((a, b) => a - b)[Math.floor(openLatencies.length * 0.95)]
      : 0;
    
    const report = {
      doubleTapWindowMs,
      lateSecondTap,
      duringScroll,
      openLatencyP95,
      openTooFar,
      totalDoubleTaps: doubleTaps.length,
      totalOpenReactions: openReactions.length,
      totalScrollEvents: scrollBegins.length
    };
    
    // Записываем отчет
    const reportPath = path.join(ROOT, 'tapdiag-report.json');
    writeFileSafe(reportPath, JSON.stringify(report, null, 2));
    
    console.log('✅ Tap diagnostics complete!');
    console.log(`📊 Report written to: ${reportPath}`);
    console.log(`🎯 Double taps: ${report.totalDoubleTaps}`);
    console.log(`📈 Late second taps: ${lateSecondTap}`);
    console.log(`📜 During scroll: ${duringScroll}`);
    console.log(`⚡ Open latency P95: ${openLatencyP95}ms`);
    console.log(`📍 Too far opens: ${openTooFar}`);
    
    // Возвращаем код ошибки если есть проблемы
    const hasIssues = lateSecondTap > 0 || duringScroll > 0 || openLatencyP95 > 300 || openTooFar > 0;
    if (hasIssues) {
      console.log('❌ Issues detected!');
      process.exitCode = 2;
    } else {
      console.log('✅ All metrics within acceptable ranges');
    }
    
    return report;
    
  } catch (error) {
    console.error('❌ Error analyzing gesture data:', error.message);
    return { error: error.message };
  }
};

// Run simulation
if (require.main === module) {
  if (TAPDIAG_MODE) {
    runTapDiagnostics();
  } else {
    runSimulation();
  }
}

module.exports = { runSimulation };
