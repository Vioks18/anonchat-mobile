#!/usr/bin/env node
// Mutation testing for QA rules
// - Copies real files to qa/tmp/
// - Mutates specific patterns
// - Runs QA scan on mutated files
// - Cleans up after testing

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const TMP_DIR = path.join(ROOT, 'qa/tmp');

const runCommand = (command) => {
  try {
    return execSync(command, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
  } catch (error) {
    return error.stdout || '';
  }
};

const cleanTmp = () => {
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true, force: true });
  }
};

const copyFile = (src, dest) => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
};

const mutateFile = (filePath, mutations) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const [pattern, replacement] of mutations) {
    content = content.replace(pattern, replacement);
  }
  
  fs.writeFileSync(filePath, content);
};

const mutations = [
  {
    name: 'Fix text shrink (should pass)',
    file: 'qa/fixtures/text_no_minwidth.tsx',
    mutations: [
      [/\/\/ нет minWidth: 0/, 'minWidth: 0,'],
      [/\/\/ нет flexShrink: 1/, 'flexShrink: 1,']
    ],
    expectedRule: 'ui.text.shrink_ok',
    shouldPass: true
  },
  {
    name: 'Add guard check (should pass)',
    file: 'qa/fixtures/reaction_guard_missing.tsx',
    mutations: [
      [/\/\/ Нет проверки if \(!visible \|\| !anchor\) return null;/, 'if (!visible || !anchor) return null;'],
    ],
    expectedRule: 'reactionbar.guard',
    shouldPass: true
  }
];

console.log('🧬 Starting mutation testing...');

// Clean up previous runs
cleanTmp();

let mutationsCaught = 0;
let mutationsMissed = 0;

for (const mutation of mutations) {
  const srcPath = path.join(ROOT, mutation.file);
  const tmpPath = path.join(TMP_DIR, mutation.file);
  
  if (!fs.existsSync(srcPath)) {
    console.log(`⚠️  Source file not found: ${mutation.file}`);
    continue;
  }
  
  console.log(`\n🔧 Testing mutation: ${mutation.name}`);
  
  // Copy file to tmp
  copyFile(srcPath, tmpPath);
  
  // Apply mutations
  mutateFile(tmpPath, mutation.mutations);
  
  // Run QA scan on tmp directory with fixtures mode
  const scanResult = runCommand(`node scripts/qa/scan.js --fixtures --report-json ${TMP_DIR}/mutation-report.json`);
  
  // Check if expected rule was triggered
  if (fs.existsSync(path.join(TMP_DIR, 'mutation-report.json'))) {
    const report = JSON.parse(fs.readFileSync(path.join(TMP_DIR, 'mutation-report.json'), 'utf8'));
    
    // Debug: show all rules in results
    const ruleIds = [...new Set(report.results.map(r => r.id))];
    console.log(`   Available rules: ${ruleIds.join(', ')}`);
    
    const ruleResult = report.results.find(r => 
      r.id === mutation.expectedRule && r.file.includes(path.basename(mutation.file))
    );
    
    if (ruleResult) {
      const passed = ruleResult.ok;
      const expected = mutation.shouldPass;
      
      if (passed === expected) {
        console.log(`✅ Mutation test passed: ${mutation.expectedRule} (${passed ? 'PASS' : 'FAIL'})`);
        mutationsCaught++;
      } else {
        console.log(`❌ Mutation test failed: ${mutation.expectedRule} expected ${expected ? 'PASS' : 'FAIL'}, got ${passed ? 'PASS' : 'FAIL'}`);
        mutationsMissed++;
      }
    } else {
      console.log(`❌ Rule ${mutation.expectedRule} not found in results`);
      mutationsMissed++;
    }
  } else {
    console.log(`❌ No scan report generated`);
    mutationsMissed++;
  }
}

// Clean up
cleanTmp();

console.log(`\n📊 Mutation testing complete:`);
console.log(`✅ Caught: ${mutationsCaught}`);
console.log(`❌ Missed: ${mutationsMissed}`);

process.exit(mutationsMissed > 0 ? 1 : 0);
