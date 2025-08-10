#!/usr/bin/env node
// Safe patch application script for QA autofixes
// - Creates new branch
// - Applies patches
// - Runs QA checks
// - Auto-reverts if P0 issues found

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = process.cwd();
const PATCHES_DIR = path.join(ROOT, 'qa-patches');

const runCommand = (command, options = {}) => {
  try {
    return execSync(command, { 
      cwd: ROOT, 
      stdio: 'inherit',
      ...options 
    });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    console.error(error.message);
    return null;
  }
};

const getCurrentBranch = () => {
  try {
    return execSync('git branch --show-current', { 
      cwd: ROOT, 
      encoding: 'utf8' 
    }).trim();
  } catch {
    return 'main';
  }
};

const createBranch = () => {
  const date = new Date().toISOString().split('T')[0];
  const branchName = `fix/qa-autofix-${date}`;
  
  console.log(`🌿 Creating branch: ${branchName}`);
  
  // Stash any changes
  runCommand('git stash push -m "qa-autofix-stash"');
  
  // Create and checkout new branch
  runCommand(`git checkout -b ${branchName}`);
  
  return branchName;
};

const applyPatches = () => {
  if (!fs.existsSync(PATCHES_DIR)) {
    console.log('❌ No patches directory found. Run `npm run qa:fix:safe` first.');
    return false;
  }
  
  const patchFiles = fs.readdirSync(PATCHES_DIR)
    .filter(file => file.endsWith('.patch'))
    .map(file => path.join(PATCHES_DIR, file));
  
  if (patchFiles.length === 0) {
    console.log('❌ No patch files found.');
    return false;
  }
  
  console.log(`🔧 Applying ${patchFiles.length} patches...`);
  
  let appliedCount = 0;
  for (const patchFile of patchFiles) {
    try {
      console.log(`  Applying: ${path.basename(patchFile)}`);
      runCommand(`git apply ${patchFile}`);
      appliedCount++;
    } catch (error) {
      console.error(`  ❌ Failed to apply: ${path.basename(patchFile)}`);
      console.error(`     ${error.message}`);
    }
  }
  
  console.log(`✅ Applied ${appliedCount}/${patchFiles.length} patches`);
  return appliedCount > 0;
};

const runQACheck = () => {
  console.log('🔍 Running QA strict check...');
  
  try {
    runCommand('npm run qa:strict');
    
    // Check if QA-REPORT.md has P0 issues
    const reportPath = path.join(ROOT, 'QA-REPORT.md');
    if (fs.existsSync(reportPath)) {
      const report = fs.readFileSync(reportPath, 'utf8');
      const hasP0Issues = report.includes('## ❌ P0 Issues') && 
                         report.includes('**NEW**');
      
      if (hasP0Issues) {
        console.log('❌ P0 issues found after applying patches');
        return false;
      }
    }
    
    console.log('✅ QA check passed - no new P0 issues');
    return true;
  } catch (error) {
    console.error('❌ QA check failed');
    return false;
  }
};

const commitChanges = (branchName) => {
  console.log('📝 Committing changes...');
  
  try {
    runCommand('git add .');
    runCommand(`git commit -m "[QA] Auto-fix: ${branchName} - Applied safe autofixes for UI/Perf rules"`);
    console.log('✅ Changes committed');
    return true;
  } catch (error) {
    console.error('❌ Failed to commit changes');
    return false;
  }
};

const revertBranch = (branchName, reason) => {
  console.log(`🔄 Reverting branch due to: ${reason}`);
  
  try {
    // Switch back to original branch
    const originalBranch = getCurrentBranch();
    runCommand(`git checkout ${originalBranch}`);
    
    // Delete the problematic branch
    runCommand(`git branch -D ${branchName}`);
    
    // Pop stash if exists
    try {
      runCommand('git stash pop');
    } catch {
      // No stash to pop
    }
    
    console.log('✅ Branch reverted successfully');
    
    // Update QA-AUTO-FIX.md with revert reason
    const reportPath = path.join(ROOT, 'QA-AUTO-FIX.md');
    if (fs.existsSync(reportPath)) {
      let report = fs.readFileSync(reportPath, 'utf8');
      report += `\n\n## ❌ Auto-Revert\n\n**Reason:** ${reason}\n**Branch:** ${branchName}\n**Time:** ${new Date().toISOString()}\n`;
      fs.writeFileSync(reportPath, report);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to revert branch');
    console.error(error.message);
    return false;
  }
};

const main = () => {
  console.log('🚀 Starting safe patch application...');
  
  // Check if patches exist
  if (!fs.existsSync(PATCHES_DIR)) {
    console.log('❌ No patches found. Run `npm run qa:fix:safe` first.');
    process.exit(1);
  }
  
  // Create new branch
  const branchName = createBranch();
  
  // Apply patches
  const patchesApplied = applyPatches();
  if (!patchesApplied) {
    console.log('❌ No patches were applied successfully');
    revertBranch(branchName, 'No patches applied');
    process.exit(1);
  }
  
  // Run QA check
  const qaPassed = runQACheck();
  if (!qaPassed) {
    console.log('❌ QA check failed - reverting changes');
    revertBranch(branchName, 'QA strict check failed - new P0 issues found');
    process.exit(1);
  }
  
  // Commit changes
  const committed = commitChanges(branchName);
  if (!committed) {
    console.log('❌ Failed to commit changes');
    revertBranch(branchName, 'Failed to commit changes');
    process.exit(1);
  }
  
  console.log('🎉 Success!');
  console.log(`✅ Branch created: ${branchName}`);
  console.log('✅ Patches applied successfully');
  console.log('✅ QA checks passed');
  console.log('✅ Changes committed');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Review the changes');
  console.log('2. Test the application');
  console.log('3. Create pull request');
  console.log('4. Merge if everything looks good');
};

if (require.main === module) {
  main();
}

module.exports = { main };
