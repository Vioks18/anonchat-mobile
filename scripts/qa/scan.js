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
const rulesConfig = JSON.parse(readFileSafe(RULES_PATH) || '{"rules":[]}');

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
const addResult = (id, severity, file, ok, message) => {
  results.push({ id, severity, file, ok, message });
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
      addResult(rule.id, rule.severity, f, ok, ok ? 'Found' : `Missing: ${rule.includes}`);
    }
  },
  mustNotInclude: (rule) => {
    for (const f of rule.files) {
      const c = getContent(f) || '';
      const bad = (rule.excludes || []).some((s) => c.includes(s));
      addResult(rule.id, rule.severity, f, !bad, bad ? `Forbidden: ${rule.excludes}` : 'OK');
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
          const hasBareConsole = /console\.(log|warn)(?!.*__DEV__)/.test(c);
          ok = !hasBareConsole;
          msg = ok ? 'logs guarded' : 'dev logs not guarded';
          if (!ok && AUTO_FIX && autofixers[rule.id]) autofixers[rule.id](f);
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
          ok = /DOUBLE_TAP_DELAY\s*=\s*2(2\d|3\d)/.test(c);
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
          msg = `unused: ${unused.join(', ')}`;
          ok = true; // report only
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
for (const rule of rulesConfig.rules || []) {
  const fn = evaluators[rule.type];
  if (fn) fn(rule);
}

// Write report
const passed = results.filter((r) => r.ok);
const failed = results.filter((r) => !r.ok && r.severity === 'P0');
const warnings = results.filter((r) => !r.ok && r.severity !== 'P0');

const report = [
  '# QA Report',
  '',
  '## ✅ Passed',
  ...passed.map((r) => `- ${r.id} (${r.severity}) — ${r.file}: ${r.message}`),
  '',
  '## ⚠️ Warnings',
  ...warnings.map((r) => `- ${r.id} (${r.severity}) — ${r.file}: ${r.message}`),
  '',
  '## ❌ P0 Issues',
  ...failed.map((r) => `- ${r.id} (${r.severity}) — ${r.file}: ${r.message}`),
  '',
  `Summary: Passed=${passed.length}, Warnings=${warnings.length}, P0=${failed.length}`
].join('\n');

writeFileSafe(path.join(ROOT, 'QA-REPORT.md'), report + '\n');

console.log('QA scan complete. Report written to QA-REPORT.md');


