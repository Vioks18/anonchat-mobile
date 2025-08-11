#!/usr/bin/env node
// Lightweight QA+Security scanner for AnonChat (no external deps)
// - Reads app/** and scripts/qa/rules.json
// - Checks mustInclude/mustNotInclude/custom rules
// - Writes QA-REPORT.md
// - --autofix: limited P0 fixes only (<=50 LOC per file)

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ARGS = process.argv.slice(2);
const AUTO_FIX = ARGS.includes('--autofix');
const DEBUG = ARGS.includes('--debug');
const QA_MODE = process.env.QA_MODE || 'strict'; // 'soft' or 'strict'

const readFileSafe = (p) => {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
};
const writeFileSafe = (p, data) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, data, 'utf8');
};
const listFilesRecursive = (dir) => {
  const out = [];
  const walk = (d) => {
    const entries = fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }) : [];
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else out.push(full);
    }
  };
  walk(dir);
  return out;
};

const RULES_PATH = path.join(ROOT, 'scripts/qa/rules.json');
const BASELINE_PATH = path.join(ROOT, 'qa-baseline.json');
const rulesConfig = JSON.parse(readFileSafe(RULES_PATH) || '{"rules":[]}');

// Load baseline if exists
let baseline = null;
try {
  if (fs.existsSync(BASELINE_PATH)) {
    baseline = JSON.parse(readFileSafe(BASELINE_PATH));
  }
} catch (error) {
  if (DEBUG) console.log('No baseline found or invalid baseline');
}

const filesCache = new Map();
const getContent = (relPath) => {
  const abs = path.join(ROOT, relPath);
  if (!filesCache.has(abs)) filesCache.set(abs, readFileSafe(abs));
  return filesCache.get(abs);
};
const setContent = (relPath, content) => {
  const abs = path.join(ROOT, relPath);
  writeFileSafe(abs, content);
  filesCache.set(abs, content);
};

const results = [];
const addResult = (id, severity, file, ok, message, isNew = false) => {
  results.push({ id, severity, file, ok, message, isNew });
};

// Helpers
const hasAllSnippets = (content, snippets) => snippets.every((s) => content.includes(s));
const wrapDevLogs = (content) => {
  const lines = content.split(/\r?\n/);
  let changed = false;
  const wrap = (line) => `if (__DEV__) ${line.trim()}`;
  const isConsole = (ln) => /console\.(log|warn)/.test(ln) && !ln.includes('__DEV__');
  // keep console.error as is (often critical), but allow wrapping too
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (isConsole(ln)) { lines[i] = wrap(ln); changed = true; }
  }
  return { content: lines.join('\n'), changed };
};

// New UI/Perf check functions
const checkUILayoutMetaInside = (content) => {
  // Check meta positioning: position:'absolute', right>=6, bottom>=2, paddingBottom>=14
  const hasAbsolutePosition = /position:\s*['"]absolute['"]/.test(content);
  const hasRightPosition = /right:\s*([0-9]+)/.test(content) && parseInt(RegExp.$1) >= 6;
  const hasBottomPosition = /bottom:\s*([0-9]+)/.test(content) && parseInt(RegExp.$1) >= 2;
  const hasPaddingBottom = /paddingBottom:\s*([0-9]+)/.test(content) && parseInt(RegExp.$1) >= 14;
  
  return hasAbsolutePosition && hasRightPosition && hasBottomPosition && hasPaddingBottom;
};

const checkUITextShrinkOk = (content) => {
  // Check minWidth: 0 on Text and flexShrink: 1 on wrapper
  const hasMinWidth = /minWidth:\s*0/.test(content);
  const hasFlexShrink = /flexShrink:\s*1/.test(content);
  
  return hasMinWidth && hasFlexShrink;
};

const checkUIPointerSafe = (content) => {
  // Check ReactionBar pointer events: outer 'box-none', inner 'auto'
  const hasBoxNone = /pointerEvents\s*=\s*['"]box-none['"]/.test(content);
  const hasAuto = /pointerEvents\s*=\s*['"]auto['"]/.test(content);
  
  return hasBoxNone && hasAuto;
};

const checkPerfMemo = (content) => {
  // Check React.memo or custom memo
  const hasReactMemo = /React\.memo/.test(content);
  const hasCustomMemo = /memo\s*\(\s*[A-Za-z]+\s*,/.test(content);
  
  return hasReactMemo || hasCustomMemo;
};

const checkSecretsPatterns = (content) => {
  // Check for API_KEY|SECRET|TOKEN|DSN|BEARER patterns
  const secretPatterns = [
    /API_KEY\s*[=:]\s*['"][A-Za-z0-9._\-]+['"]/,
    /SECRET\s*[=:]\s*['"][A-Za-z0-9._\-]+['"]/,
    /TOKEN\s*[=:]\s*['"][A-Za-z0-9._\-]+['"]/,
    /DSN\s*[=:]\s*['"][A-Za-z0-9._\-]+['"]/,
    /BEARER\s+[A-Za-z0-9._\-]+/
  ];
  
  return !secretPatterns.some(pattern => pattern.test(content));
};

const checkHeavyDeps = () => {
  const heavyPackages = [
    'react-native-reanimated',
    'react-native-gesture-handler', 
    'react-native-camera',
    'expo-notifications',
    'react-native-vision-camera',
    'react-native-video',
    '@react-native-firebase',
    'sentry-',
    'realm'
  ];
  
  const packageJson = readFileSafe('package.json');
  if (!packageJson) return true;
  
  const packageData = JSON.parse(packageJson);
  const deps = { ...packageData.dependencies, ...packageData.devDependencies };
  
  const appFiles = listFilesRecursive('app').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  const allImports = appFiles.map(f => getContent(f)).join('\n');
  
  const unusedHeavy = [];
  for (const pkg of Object.keys(deps)) {
    if (heavyPackages.some(heavy => pkg.includes(heavy))) {
      if (!allImports.includes(pkg) && !allImports.includes(pkg.replace('@react-native-firebase/', ''))) {
        unusedHeavy.push(pkg);
      }
    }
  }
  
  return unusedHeavy.length === 0;
};

// Функция для подсчета строк в файле
const countLines = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
};

// Функция для проверки размера файла
const checkFileSize = (filePath, maxLines, allowlist) => {
  const relativePath = path.relative(ROOT, filePath);
  
  // Проверяем, есть ли файл в allowlist
  if (allowlist && allowlist.includes(relativePath)) {
    return { ok: true, loc: countLines(filePath), message: 'file in allowlist' };
  }
  
  const loc = countLines(filePath);
  const ok = loc <= maxLines;
  const message = ok ? `LOC: ${loc} <= ${maxLines}` : `File exceeds max lines (${loc} > ${maxLines}): ${relativePath}`;
  
  return { ok, loc, message };
};

// Filter rules based on mode
const filterRules = (rules) => {
  if (QA_MODE === 'strict') {
    return rules.filter(rule => {
      // Skip experimental rules in strict mode
      if (rule.experimental === true) {
        if (DEBUG) console.log(`Skipping experimental rule: ${rule.id}`);
        return false;
      }
      
      // Skip rules for files in allowlist (only if rule has files field)
      if (rule.allowlist && rule.allowlist.length > 0 && rule.files) {
        const shouldSkip = rule.files.some(file => 
          rule.allowlist.some(allowed => file.includes(allowed))
        );
        if (shouldSkip && DEBUG) {
          console.log(`Skipping rule ${rule.id} due to allowlist: ${rule.allowlist.join(', ')}`);
        }
        return !shouldSkip;
      }
      
      return true;
    });
  }
  return rules; // soft mode includes all rules
};

// Autofixers (P0 only)
const autofixers = {
  'store.status_read': (file) => {
    let content = getContent(file) || '';
    // Replace array of statuses, ensure 'read' present and 'error' not enforced
    content = content.replace(
      /(\[\s*\"sending\"\s*,\s*\"sent\"\s*,\s*\"delivered\"\s*,\s*\")error(\"\s*\])/,
      '$1read$2'
    );
    setContent(file, content);
  },
  'perf.dev_logs': (file) => {
    const before = getContent(file) || '';
    const { content, changed } = wrapDevLogs(before);
    if (changed) setContent(file, content);
  },
};

// Rule evaluators
const evaluators = {
  mustInclude: (rule) => {
    for (const f of rule.files) {
      const c = getContent(f) || '';
      const ok = hasAllSnippets(c, rule.includes || []);
      const msg = ok ? 'Found' : `Missing: ${rule.includes}`;
      if (DEBUG && !ok) {
        console.log(`❌ ${rule.id}: ${f} - ${msg}`);
        console.log(`   Looking for: ${rule.includes.join(', ')}`);
      }
      addResult(rule.id, rule.severity, f, ok, msg);
    }
  },
  mustNotInclude: (rule) => {
    for (const f of rule.files) {
      const c = getContent(f) || '';
      const bad = (rule.excludes || []).some((s) => c.includes(s));
      const msg = bad ? `Forbidden: ${rule.excludes}` : 'OK';
      if (DEBUG && bad) {
        console.log(`❌ ${rule.id}: ${f} - ${msg}`);
        console.log(`   Found forbidden: ${rule.excludes.join(', ')}`);
      }
      addResult(rule.id, rule.severity, f, !bad, msg);
    }
  },
  custom: (rule) => {
    // Обработка правил без поля files (например, bigfile.max_lines)
    if (!rule.files) {
      let ok = true;
      let msg = 'OK';
      switch (rule.id) {
        case 'bigfile.max_lines': {
          // Сканируем все файлы в app/ директории
          const appFiles = listFilesRecursive(path.join(ROOT, 'app'))
            .filter(p => /\.(t|j)sx?$/.test(p))
            .filter(p => !p.includes('backup') && !p.includes('mocks') && !p.includes('node_modules') && 
                        !p.includes('.expo') && !p.includes('android') && !p.includes('ios') && 
                        !p.includes('dist') && !p.includes('build'));
          
          let allOk = true;
          let issues = [];
          
          for (const filePath of appFiles) {
            const result = checkFileSize(filePath, rule.max || 300, rule.allowlist);
            if (!result.ok) {
              allOk = false;
              issues.push(result.message);
            }
          }
          
          ok = allOk;
          msg = ok ? `all files <= ${rule.max || 300} lines` : `files too large: ${issues.slice(0, 3).join(', ')}${issues.length > 3 ? '...' : ''}`;
          addResult(rule.id, rule.severity, 'app/**/*.{ts,tsx,js,jsx}', ok, msg);
          return;
        }
        default:
          return;
      }
    }
    
    // Обработка правил с полем files
    for (const f of rule.files) {
      const c = getContent(f) || '';
      let ok = true;
      let msg = 'OK';
      switch (rule.id) {
        case 'store.status_read': {
          ok = /(\[[^\]]*\bread\b[^\]]*\])/.test(c);
          msg = ok ? 'read in statuses' : 'read missing in statuses';
          if (!ok && AUTO_FIX && autofixers[rule.id]) autofixers[rule.id](f);
          break;
        }
        case 'perf.dev_logs': {
          // Updated regex to ignore commented lines
          const lines = c.split('\n');
          const hasBareConsole = lines.some(line => {
            const trimmed = line.trim();
            return trimmed.includes('console.') && 
                   !trimmed.startsWith('//') && 
                   !trimmed.startsWith('/*') &&
                   !trimmed.includes('__DEV__');
          });
          ok = !hasBareConsole;
          msg = ok ? 'logs guarded' : 'dev logs not guarded';
          if (!ok && AUTO_FIX && autofixers[rule.id]) autofixers[rule.id](f);
          if (DEBUG && !ok) {
            console.log(`❌ ${rule.id}: ${f} - ${msg}`);
            console.log(`   Found unguarded console statements`);
          }
          break;
        }
        case 'reactionstate.keyboard_close': {
          ok = /Keyboard\.addListener\(\'keyboardDidShow\'/.test(c) || /keyboardWillShow/.test(c);
          msg = ok ? 'keyboard listeners present' : 'keyboard listeners missing';
          break;
        }
        case 'perf.memo_bubble': {
          ok = /React\.memo\(/.test(c);
          msg = ok ? 'memo present' : 'not memoized';
          break;
        }
        case 'perf.stable_handlers': {
          ok = /useCallback\(/.test(c);
          msg = ok ? 'callbacks memoized' : 'handlers not memoized';
          break;
        }
        case 'reactionbar.clamp_flip_safe': {
          ok = /useSafeAreaInsets\(/.test(c) && /Dimensions\.get\(\'window\'\)\.width/.test(c);
          msg = ok ? 'safe area + clamp logic present' : 'missing clamp/safe area';
          break;
        }
        case 'chatlist.doubletap_window': {
          const match = c.match(/WIN\s*=\s*(\d+)/);
          ok = match && (parseInt(match[1]) >= 220 && parseInt(match[1]) <= 300);
          msg = ok ? 'double-tap window ok' : 'double-tap window not in 220–300ms';
          break;
        }
        case 'deps.unused': {
          const pkg = JSON.parse(getContent('package.json') || '{}');
          const deps = Object.keys(pkg.dependencies || {});
          const appFiles = listFilesRecursive(path.join(ROOT, 'app'))
            .filter((p) => /\.(t|j)sx?$/.test(p));
          const appContent = appFiles.map((p) => readFileSafe(p)).join('\n');
          const unused = deps.filter((d) => !new RegExp(`from ['\"]${d}['\"]|require\(['\"]${d}['\"]\)`).test(appContent));
          ok = unused.length === 0;
          msg = ok ? 'all deps used' : `unused: ${unused.slice(0, 5).join(', ')}${unused.length > 5 ? '...' : ''}`;
          break;
        }
        case 'ui.layout.meta_inside': {
          ok = checkUILayoutMetaInside(c);
          msg = ok ? 'meta positioned correctly' : 'meta positioning issues';
          break;
        }
        case 'ui.text.shrink_ok': {
          ok = checkUITextShrinkOk(c);
          msg = ok ? 'text shrink ok' : 'text shrink issues';
          break;
        }
        case 'ui.pointer.safe': {
          ok = checkUIPointerSafe(c);
          msg = ok ? 'pointer events safe' : 'pointer events issues';
          break;
        }
        case 'perf.memo': {
          ok = checkPerfMemo(c);
          msg = ok ? 'memo present' : 'not memoized';
          break;
        }
        case 'secrets.patterns': {
          ok = checkSecretsPatterns(c);
          msg = ok ? 'no secrets found' : 'potential secrets found';
          break;
        }
        case 'deps.heavy_inactive': {
          ok = checkHeavyDeps();
          msg = ok ? 'no heavy unused deps' : 'heavy unused deps found';
          break;
        }
        case 'bubble.paddingRight.meta': {
          const match = c.match(/paddingRight:\s*(\d+)/);
          ok = match && parseInt(match[1]) >= 28;
          msg = ok ? 'paddingRight >= 28' : 'paddingRight < 28';
          break;
        }
        case 'doubleTap.window': {
          const match = c.match(/WIN\s*=\s*(\d+)/);
          ok = match && (parseInt(match[1]) >= 220 && parseInt(match[1]) <= 300);
          msg = ok ? 'window 220-300ms' : 'window not 220-300ms';
          break;
        }
        case 'scroll.gate': {
          ok = /scrollingRef\.current/.test(c) && /handleScrollBeginDrag/.test(c);
          msg = ok ? 'scroll gate present' : 'scroll gate missing';
          break;
        }
        case 'anchor.touchXY': {
          ok = /touchX\?/.test(c) && /touchY\?/.test(c) && /setLastTouch/.test(c);
          msg = ok ? 'touchXY support present' : 'touchXY support missing';
          break;
        }
        case 'secrets.regex': {
          const secrets = c.match(/(API_KEY|SECRET|Bearer\s+\w+)/g);
          ok = !secrets || secrets.length === 0;
          msg = ok ? 'no secrets found' : `secrets found: ${secrets?.slice(0, 3).join(', ')}`;
          break;
        }
        case 'gestures.doubletap.behavior': {
          const tapdiagPath = path.join(ROOT, 'tapdiag-report.json');
          if (!fs.existsSync(tapdiagPath)) {
            ok = false;
            msg = 'tapdiag-report.json not found - run npm run qa:gestures first';
            if (DEBUG) console.log('No tapdiag-report.json found, suggesting to run gesture diagnostics');
          } else {
            try {
              const tapdiag = JSON.parse(readFileSafe('tapdiag-report.json'));
              
              // Проверяем пороги
              const lateSecondTapOk = tapdiag.lateSecondTap === 0;
              const duringScrollOk = tapdiag.duringScroll === 0;
              const openLatencyOk = tapdiag.openLatencyP95 < 300;
              const openTooFarOk = tapdiag.openTooFar === 0;
              
              ok = lateSecondTapOk && duringScrollOk && openLatencyOk && openTooFarOk;
              
              const issues = [];
              if (!lateSecondTapOk) issues.push(`lateSecondTap: ${tapdiag.lateSecondTap} > 0`);
              if (!duringScrollOk) issues.push(`duringScroll: ${tapdiag.duringScroll} > 0`);
              if (!openLatencyOk) issues.push(`openLatencyP95: ${tapdiag.openLatencyP95} > 300ms`);
              if (!openTooFarOk) issues.push(`openTooFar: ${tapdiag.openTooFar} > 0`);
              
              msg = ok 
                ? 'all gesture metrics within limits' 
                : `gesture issues: ${issues.join(', ')}`;
              
              if (DEBUG) {
                console.log('Tap diagnostics results:', {
                  lateSecondTap: tapdiag.lateSecondTap,
                  duringScroll: tapdiag.duringScroll,
                  openLatencyP95: tapdiag.openLatencyP95,
                  openTooFar: tapdiag.openTooFar
                });
              }
            } catch (error) {
              ok = false;
              msg = `error reading tapdiag-report.json: ${error.message}`;
            }
          }
          break;
        }
        default:
          break;
      }
      addResult(rule.id, rule.severity, f, ok, msg);
    }
  }
};

// Run rules
const filteredRules = filterRules(rulesConfig.rules || []);
for (const rule of filteredRules) {
  const fn = evaluators[rule.type];
  if (fn) fn(rule);
}

// Compare with baseline
let newIssuesCount = 0;
if (baseline) {
  const baselineKeys = new Set(baseline.map(r => `${r.id}:${r.file}`));
  results.forEach(result => {
    const resultKey = `${result.id}:${result.file}`;
    if (!result.ok && !baselineKeys.has(resultKey)) {
      result.isNew = true;
      newIssuesCount++;
    }
  });
}

// Write report
const passed = results.filter((r) => r.ok);
const failed = results.filter((r) => !r.ok && r.severity === 'P0');
const warnings = results.filter((r) => !r.ok && r.severity !== 'P0');

const report = [
  '# QA Report',
  '',
  `**Mode:** ${QA_MODE}`,
  `**New issues:** ${newIssuesCount}`,
  '',
  '## ✅ Passed',
  ...passed.map((r) => `- ${r.id} (${r.severity}) — ${r.file}: ${r.message}`),
  '',
  '## ⚠️ Warnings',
  ...warnings.map((r) => `- ${r.id} (${r.severity}) — ${r.file}: ${r.message}${r.isNew ? ' **NEW**' : ''}`),
  '',
  '## ❌ P0 Issues',
  ...failed.map((r) => `- ${r.id} (${r.severity}) — ${r.file}: ${r.message}${r.isNew ? ' **NEW**' : ''}`),
  '',
  `Summary: Passed=${passed.length}, Warnings=${warnings.length}, P0=${failed.length}`
].join('\n');

writeFileSafe(path.join(ROOT, 'QA-REPORT.md'), report + '\n');

console.log(`QA scan complete (${QA_MODE} mode). Report written to QA-REPORT.md`);
if (newIssuesCount > 0) {
  console.log(`⚠️  ${newIssuesCount} new issues found compared to baseline`);
}


