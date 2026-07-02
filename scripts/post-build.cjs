#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// After Vite build, replace dist/index.html with maintenance page
const distDir = path.join(process.cwd(), 'dist');
const maintenanceFile = path.join(process.cwd(), 'public', 'maintenance.html');
const distIndexFile = path.join(distDir, 'index.html');

try {
  if (fs.existsSync(maintenanceFile)) {
    const maintenanceContent = fs.readFileSync(maintenanceFile, 'utf-8');
    fs.writeFileSync(distIndexFile, maintenanceContent, 'utf-8');
    console.log('✅ Replaced dist/index.html with maintenance.html');
  } else {
    console.warn('⚠️ maintenance.html not found');
  }
} catch (err) {
  console.error('❌ Error replacing index.html:', err.message);
  process.exit(1);
}
