#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying NestJS module files...');

const filesToCheck = [
  'src/app.module.ts',
  'src/main.ts',
  'src/logs/logs.module.ts',
  'src/logs/logs.controller.ts',
  'src/logs/logs.service.ts',
  'src/logs/dto/log.dto.ts',
  'src/image/image.module.ts',
  'src/image/image.controller.ts',
  'src/image/image.service.ts',
  'src/database/database.module.ts'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - NOT FOUND`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('🎉 All required files exist!');
  process.exit(0);
} else {
  console.log('💥 Some files are missing!');
  process.exit(1);
}
