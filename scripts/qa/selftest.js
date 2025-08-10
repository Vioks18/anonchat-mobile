#!/usr/bin/env node
// Self-test orchestrator for QA system
// - Runs fixtures scan
// - Validates rule coverage
// - Runs mutation testing
// - Generates snapshots

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const RULES_PATH = path.join(ROOT, 'scripts/qa/rules.json');
const FIXTURES_MAP_PATH = path.join(ROOT, 'qa/fixtures.map.json');
const SNAPSHOT_PATH = path.join(ROOT, 'qa/snapshots/report.ok.json');

const runCommand = (command) => {
  try {
    return execSync(command, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
  } catch (error) {
    return error.stdout || '';
  }
};

const loadJson = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
};

console.log('🧪 Starting QA self-test...\n');

// Step 1: Run fixtures scan
console.log('📋 Step 1: Running fixtures scan...');
runCommand('node scripts/qa/scan.js --fixtures --report-json qa/last-fixtures.json');

const fixturesReport = loadJson(path.join(ROOT, 'qa/last-fixtures.json'));
const fixturesMap = loadJson(FIXTURES_MAP_PATH);
const rulesConfig = loadJson(RULES_PATH);

// Step 2: Validate rule coverage
console.log('\n📊 Step 2: Validating rule coverage...');

const activeRules = rulesConfig.rules || [];
const fixtureRules = Object.keys(fixturesMap);
const coveredRules = new Set();

// Check which rules have failures in fixtures (meaning they were triggered)
for (const result of fixturesReport.results || []) {
  if (!result.ok) {
    coveredRules.add(result.id);
  }
}

// Only check rules that can be tested with fixtures
const testableRules = activeRules.filter(rule => fixtureRules.includes(rule.id));
const totalRules = testableRules.length;
const coveredCount = coveredRules.size;
const coveragePercent = Math.round((coveredCount / totalRules) * 100);

console.log(`Rules covered: ${coveredCount}/${totalRules} (${coveragePercent}% = ${coveragePercent === 100 ? 'OK' : 'FAIL'})`);

// Find rules without coverage (only testable ones)
const uncoveredRules = testableRules
  .filter(rule => !coveredRules.has(rule.id))
  .map(rule => rule.id);

if (uncoveredRules.length > 0) {
  console.log('\n❌ Rules without coverage:');
  uncoveredRules.forEach(rule => console.log(`  - ${rule}`));
}

// Step 3: Generate snapshot if needed
console.log('\n📸 Step 3: Generating snapshot...');
if (!fs.existsSync(SNAPSHOT_PATH) || Object.keys(loadJson(SNAPSHOT_PATH)).length === 0) {
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(fixturesReport, null, 2));
  console.log('✅ Snapshot created');
} else {
  console.log('✅ Snapshot already exists');
}

// Step 4: Run mutation testing
console.log('\n🧬 Step 4: Running mutation testing...');
const mutationResult = runCommand('node scripts/qa/mutate.js');
console.log(mutationResult);

// Parse mutation results
const mutationsCaught = (mutationResult.match(/✅ Caught: (\d+)/) || [])[1] || 0;
const mutationsMissed = (mutationResult.match(/❌ Missed: (\d+)/) || [])[1] || 0;

// Final summary
console.log('\n📋 Final Summary:');
console.log(`Rules covered: ${coveredCount}/${totalRules} (${coveragePercent}% = ${coveragePercent === 100 ? 'OK' : 'FAIL'})`);
console.log(`Mutations caught: ${mutationsCaught} (OK) / missed: ${mutationsMissed}`);

// Determine exit code
const hasUncoveredRules = uncoveredRules.length > 0;
const hasMissedMutations = parseInt(mutationsMissed) > 0;

if (hasUncoveredRules || hasMissedMutations) {
  console.log('\n❌ Self-test FAILED');
  process.exit(1);
} else {
  console.log('\n✅ Self-test PASSED');
  process.exit(0);
}
