#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-eject guard checks...\n');

const report = {
  timestamp: new Date().toISOString(),
  checks: {},
  ok: true,
  errors: [],
  warnings: []
};

// Check 1: Babel config has Reanimated plugin
function checkBabelConfig() {
  try {
    const babelConfigPath = path.join(process.cwd(), 'babel.config.js');
    if (!fs.existsSync(babelConfigPath)) {
      report.checks.babelConfig = { ok: false, error: 'babel.config.js not found' };
      report.ok = false;
      report.errors.push('babel.config.js not found');
      return;
    }

    const babelConfig = fs.readFileSync(babelConfigPath, 'utf8');
    const hasReanimatedPlugin = babelConfig.includes("'react-native-reanimated/plugin'");
    
    if (hasReanimatedPlugin) {
      report.checks.babelConfig = { ok: true, message: 'Reanimated plugin found' };
    } else {
      report.checks.babelConfig = { ok: false, error: 'Reanimated plugin missing' };
      report.ok = false;
      report.errors.push('Reanimated plugin missing in babel.config.js');
    }
  } catch (error) {
    report.checks.babelConfig = { ok: false, error: error.message };
    report.ok = false;
    report.errors.push(`Babel config check failed: ${error.message}`);
  }
}

// Check 2: No stray gradle.properties in root
function checkGradleProperties() {
  const gradlePropsPath = path.join(process.cwd(), 'gradle.properties');
  if (fs.existsSync(gradlePropsPath)) {
    report.checks.gradleProperties = { ok: false, error: 'gradle.properties found in root (should not exist in managed Expo)' };
    report.ok = false;
    report.errors.push('gradle.properties found in root - this should not exist in managed Expo workflow');
  } else {
    report.checks.gradleProperties = { ok: true, message: 'No stray gradle.properties in root' };
  }
}

// Check 3: google-services.json exists
function checkGoogleServices() {
  const googleServicesPath = path.join(process.cwd(), 'google-services.json');
  if (fs.existsSync(googleServicesPath)) {
    report.checks.googleServices = { ok: true, message: 'google-services.json found' };
  } else {
    report.checks.googleServices = { ok: false, error: 'google-services.json not found' };
    report.ok = false;
    report.errors.push('google-services.json not found in root');
  }
}

// Check 4: app.config.js has required fields
function checkAppConfig() {
  try {
    const appConfigPath = path.join(process.cwd(), 'app.config.js');
    if (!fs.existsSync(appConfigPath)) {
      report.checks.appConfig = { ok: false, error: 'app.config.js not found' };
      report.ok = false;
      report.errors.push('app.config.js not found');
      return;
    }

    const appConfig = fs.readFileSync(appConfigPath, 'utf8');
    const checks = {
      hasAndroidPackage: appConfig.includes('package: "com.axora.anonchat"'),
      hasBuildProperties: appConfig.includes('expo-build-properties'),
      hasJsEngine: appConfig.includes('jsEngine: "hermes"'),
      hasTsconfigPaths: appConfig.includes('tsconfigPaths: true')
    };

    const allPassed = Object.values(checks).every(Boolean);
    if (allPassed) {
      report.checks.appConfig = { ok: true, message: 'All required app.config.js fields present' };
    } else {
      const missing = Object.entries(checks)
        .filter(([, passed]) => !passed)
        .map(([key]) => key);
      report.checks.appConfig = { ok: false, error: `Missing fields: ${missing.join(', ')}` };
      report.ok = false;
      report.errors.push(`app.config.js missing fields: ${missing.join(', ')}`);
    }
  } catch (error) {
    report.checks.appConfig = { ok: false, error: error.message };
    report.ok = false;
    report.errors.push(`App config check failed: ${error.message}`);
  }
}

// Run all checks
checkBabelConfig();
checkGradleProperties();
checkGoogleServices();
checkAppConfig();

// Write report
const reportPath = path.join(process.cwd(), 'qa', 'eject-guard.json');
const qaDir = path.dirname(reportPath);

if (!fs.existsSync(qaDir)) {
  fs.mkdirSync(qaDir, { recursive: true });
}

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

// Output results
console.log('📋 Guard Check Results:');
console.log('========================');

Object.entries(report.checks).forEach(([check, result]) => {
  const status = result.ok ? '✅' : '❌';
  const message = result.ok ? result.message : result.error;
  console.log(`${status} ${check}: ${message}`);
});

console.log('\n📊 Summary:');
if (report.ok) {
  console.log('✅ All checks passed! Ready for prebuild.');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  console.log('\nErrors:');
  report.errors.forEach(error => console.log(`  - ${error}`));
}

if (report.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  report.warnings.forEach(warning => console.log(`  - ${warning}`));
}

console.log(`\n📄 Report written to: ${reportPath}`);

// Exit with appropriate code
process.exit(report.ok ? 0 : 1);
