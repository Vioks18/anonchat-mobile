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
const AUTO_FIX_SAFE = ARGS.includes('--autofix-safe');
const DEBUG = ARGS.includes('--debug');
const QA_MODE = process.env.QA_MODE || 'strict'; // 'soft' or 'strict'

// Safe autofix configuration
const SAFE_AUTOFIX_CONFIG = {
  maxChangesPerFile: 3,
  maxFilesPerRun: 5,
  stoplist: [
    'ReactionBar.tsx',
    'useReactionState.ts', 
    'ChatListWithReactions.tsx',
    'reactions/',
    'gestures/'
  ],
  allowedRules: [
    'perf.dev_logs',
    'ui.text.shrink_ok', 
    'ui.layout.meta_inside',
    'perf.memo'
  ],
  allowedFiles: [
    'MessageWithReactions.tsx',
    'ChatMessage.tsx',
    'useMessageStore.ts',
    'useUIWatchDog.ts',
    'useBotProvider.ts'
  ]
};

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

// Safe autofix functions
const isFileAllowed = (filePath) => {
  const fileName = path.basename(filePath);
  const fileDir = path.dirname(filePath);
  
  // Check stoplist
  if (SAFE_AUTOFIX_CONFIG.stoplist.some(stop => 
    fileName.includes(stop) || fileDir.includes(stop)
  )) {
    return false;
  }
  
  // Check allowed files
  return SAFE_AUTOFIX_CONFIG.allowedFiles.some(allowed => 
    fileName.includes(allowed)
  );
};

const isRuleAllowed = (ruleId) => {
  return SAFE_AUTOFIX_CONFIG.allowedRules.includes(ruleId);
};

const generatePatch = (filePath, originalContent, newContent) => {
  const fileName = path.basename(filePath);
  const patchDir = path.join(ROOT, 'qa-patches');
  fs.mkdirSync(patchDir, { recursive: true });
  
  const patchPath = path.join(patchDir, `${fileName}.patch`);
  const patch = `--- ${filePath}
+++ ${filePath}
${generateDiff(originalContent, newContent)}`;
  
  fs.writeFileSync(patchPath, patch);
  return patchPath;
};

const generateDiff = (original, modified) => {
  const originalLines = original.split('\n');
  const modifiedLines = modified.split('\n');
  let diff = '';
  let lineNumber = 1;
  
  for (let i = 0; i < Math.max(originalLines.length, modifiedLines.length); i++) {
    const originalLine = originalLines[i] || '';
    const modifiedLine = modifiedLines[i] || '';
    
    if (originalLine !== modifiedLine) {
      diff += `@@ -${lineNumber},1 +${lineNumber},1 @@\n`;
      diff += `-${originalLine}\n`;
      diff += `+${modifiedLine}\n`;
    }
    lineNumber++;
  }
  
  return diff;
};

const safeAutofixers = {
  'perf.dev_logs': (filePath) => {
    if (!isFileAllowed(filePath)) return { applied: false, reason: 'file not allowed' };
    
    const content = getContent(filePath) || '';
    const { content: newContent, changed } = wrapDevLogs(content);
    
    if (!changed) return { applied: false, reason: 'no changes needed' };
    
    return { 
      applied: true, 
      original: content, 
      modified: newContent,
      description: 'Wrapped console.log/warn in if (__DEV__)'
    };
  },
  
  'ui.text.shrink_ok': (filePath) => {
    if (!isFileAllowed(filePath)) return { applied: false, reason: 'file not allowed' };
    
    const content = getContent(filePath) || '';
    let modified = content;
    let changes = 0;
    
    // Add minWidth: 0 to Text components
    if (!/minWidth:\s*0/.test(content)) {
      modified = modified.replace(
        /(messageText:\s*{[^}]*)/g,
        '$1,\n    minWidth: 0'
      );
      changes++;
    }
    
    // Add flexShrink: 1 to message wrapper
    if (!/flexShrink:\s*1/.test(content)) {
      modified = modified.replace(
        /(messageContent:\s*{[^}]*)/g,
        '$1,\n    flexShrink: 1'
      );
      changes++;
    }
    
    if (changes === 0) return { applied: false, reason: 'no changes needed' };
    
    return { 
      applied: true, 
      original: content, 
      modified,
      description: `Added minWidth: 0 and flexShrink: 1 (${changes} changes)`
    };
  },
  
  'ui.layout.meta_inside': (filePath) => {
    if (!isFileAllowed(filePath)) return { applied: false, reason: 'file not allowed' };
    
    const content = getContent(filePath) || '';
    let modified = content;
    
    // Check if file has time/ticks and needs paddingBottom
    const hasTimeTicks = /timeText|statusIcon|ActivityIndicator/.test(content);
    const currentPaddingBottom = content.match(/paddingBottom:\s*(\d+)/);
    const currentPB = currentPaddingBottom ? parseInt(currentPaddingBottom[1]) : 0;
    
    if (!hasTimeTicks || currentPB >= 12) {
      return { applied: false, reason: 'no time/ticks or paddingBottom already sufficient' };
    }
    
    // Add paddingBottom: 14-16 to bubble
    const newPaddingBottom = Math.max(14, currentPB + 2);
    modified = modified.replace(
      /(bubble:\s*{[^}]*)/g,
      `$1,\n    paddingBottom: ${newPaddingBottom}`
    );
    
    return { 
      applied: true, 
      original: content, 
      modified,
      description: `Added paddingBottom: ${newPaddingBottom} to bubble`
    };
  },
  
  'perf.memo': (filePath) => {
    if (!isFileAllowed(filePath)) return { applied: false, reason: 'file not allowed' };
    
    const content = getContent(filePath) || '';
    
    // Check if already memoized
    if (/React\.memo|memo\s*\(/.test(content)) {
      return { applied: false, reason: 'already memoized' };
    }
    
    // Check for stable key and no side effects
    const hasStableKey = /key.*message\.id|key.*id/.test(content);
    const hasSideEffects = /useEffect|useState|useCallback/.test(content);
    
    if (!hasStableKey || hasSideEffects) {
      return { applied: false, reason: 'no stable key or has side effects - suggest manual review' };
    }
    
    // Add React.memo wrapper
    const modified = content.replace(
      /export default (\w+);/,
      'export default React.memo($1);'
    );
    
    return { 
      applied: true, 
      original: content, 
      modified,
      description: 'Wrapped component in React.memo'
    };
  }
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
      
      // Skip rules for files in allowlist
      if (rule.allowlist && rule.allowlist.length > 0) {
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

// Helper function to extract code snippets
const extractSnippet = (content, contextLines = 3) => {
  const lines = content.split('\n');
  const changedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('minWidth:') || lines[i].includes('flexShrink:') || 
        lines[i].includes('paddingBottom:') || lines[i].includes('React.memo') ||
        lines[i].includes('console.')) {
      const start = Math.max(0, i - contextLines);
      const end = Math.min(lines.length, i + contextLines + 1);
      changedLines.push(...lines.slice(start, end));
    }
  }
  
  return changedLines.slice(0, 10).join('\n'); // Limit to 10 lines
};

// Generate autofix report
const generateAutofixReport = (results, patches) => {
  const report = [
    '# QA Auto-Fix Report',
    '',
    `**Generated:** ${new Date().toISOString()}`,
    `**Mode:** DRY-RUN`,
    `**Patches:** ${patches.length}`,
    `**Files processed:** ${results.filter(r => r.status === 'patched').length}`,
    '',
    '## 📋 Summary',
    '',
    '| File | Rule | Status | Description |',
    '|------|------|--------|-------------|',
    ...results.map(r => `| ${r.file} | ${r.rule} | ${r.status} | ${r.reason || r.description || '-'} |`),
    '',
    '## 🔧 Applied Fixes',
    ''
  ];
  
  const appliedFixes = results.filter(r => r.status === 'patched');
  for (const fix of appliedFixes) {
    report.push(`### ${fix.file} (${fix.rule})`);
    report.push('');
    report.push(`**Description:** ${fix.description}`);
    report.push(`**Patch:** \`${fix.patch}\``);
    report.push('');
    report.push('**Before:**');
    report.push('```typescript');
    report.push(fix.before);
    report.push('```');
    report.push('');
    report.push('**After:**');
    report.push('```typescript');
    report.push(fix.after);
    report.push('```');
    report.push('');
  }
  
  if (appliedFixes.length === 0) {
    report.push('No fixes applied.');
  }
  
  report.push('');
  report.push('## 📝 Suggestions');
  report.push('');
  
  const suggestions = results.filter(r => r.status === 'skipped' && r.reason.includes('suggest'));
  for (const suggestion of suggestions) {
    report.push(`- **${suggestion.file}** (${suggestion.rule}): ${suggestion.reason}`);
  }
  
  if (suggestions.length === 0) {
    report.push('No suggestions.');
  }
  
  report.push('');
  report.push('## 🚀 Next Steps');
  report.push('');
  report.push('1. Review generated patches in `qa-patches/`');
  report.push('2. Run `npm run qa:fix:apply` to apply patches in new branch');
  report.push('3. Test changes and run `npm run qa:strict`');
  report.push('4. Merge if all tests pass');
  
  writeFileSafe('QA-AUTO-FIX.md', report.join('\n'));
};

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

// Safe autofix logic (after all functions are defined)
if (AUTO_FIX_SAFE) {
  console.log('🔧 Running safe autofix (DRY-RUN mode)...');
  
  const autofixResults = [];
  const patches = [];
  let filesProcessed = 0;
  
  // Process failed rules that can be autofixed
  const failedRules = results.filter(r => !r.ok && isRuleAllowed(r.id));
  
  for (const result of failedRules) {
    if (filesProcessed >= SAFE_AUTOFIX_CONFIG.maxFilesPerRun) {
      autofixResults.push({
        file: result.file,
        rule: result.id,
        status: 'skipped',
        reason: 'max files limit reached'
      });
      continue;
    }
    
    if (!isFileAllowed(result.file)) {
      autofixResults.push({
        file: result.file,
        rule: result.id,
        status: 'skipped',
        reason: 'file in stoplist or not allowed'
      });
      continue;
    }
    
    const autofixer = safeAutofixers[result.id];
    if (!autofixer) {
      autofixResults.push({
        file: result.file,
        rule: result.id,
        status: 'skipped',
        reason: 'no autofixer available'
      });
      continue;
    }
    
    const fixResult = autofixer(result.file);
    
    if (fixResult.applied) {
      // Generate patch
      const patchPath = generatePatch(result.file, fixResult.original, fixResult.modified);
      patches.push(patchPath);
      
      autofixResults.push({
        file: result.file,
        rule: result.id,
        status: 'patched',
        description: fixResult.description,
        patch: patchPath,
        before: extractSnippet(fixResult.original, 3),
        after: extractSnippet(fixResult.modified, 3)
      });
      
      filesProcessed++;
    } else {
      autofixResults.push({
        file: result.file,
        rule: result.id,
        status: 'skipped',
        reason: fixResult.reason
      });
    }
  }
  
  // Generate QA-AUTO-FIX.md report
  generateAutofixReport(autofixResults, patches);
  
  console.log(`✅ Safe autofix complete: ${patches.length} patches generated`);
  console.log(`📄 Report: QA-AUTO-FIX.md`);
  console.log(`📁 Patches: qa-patches/`);
}


