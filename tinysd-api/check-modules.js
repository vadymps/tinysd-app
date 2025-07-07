#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for potential module issues...');

// Check for any potential import issues
const srcDir = path.join(__dirname, 'src');

function findTsFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

const tsFiles = findTsFiles(srcDir);
console.log(`📁 Found ${tsFiles.length} TypeScript files`);

// Check for basic syntax issues
let hasIssues = false;

for (const file of tsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(__dirname, file);
  
  // Check for common issues
  if (content.includes('undefined')) {
    console.log(`⚠️  ${relativePath}: Contains 'undefined' keyword`);
  }
  
  if (content.includes('\r\n') && !content.includes('\n')) {
    console.log(`⚠️  ${relativePath}: Has Windows line endings`);
  }
  
  // Check for module exports
  if (file.includes('module.ts') && !content.includes('@Module')) {
    console.log(`❌ ${relativePath}: Missing @Module decorator`);
    hasIssues = true;
  }
  
  console.log(`✅ ${relativePath}`);
}

if (!hasIssues) {
  console.log('🎉 No major issues found!');
} else {
  console.log('💥 Found some issues that might cause CI/CD problems');
}
