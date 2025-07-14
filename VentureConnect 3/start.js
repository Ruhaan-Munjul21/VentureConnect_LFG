#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Safety check for path resolution in Railway environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(`🚀 Starting production server...`);
console.log(`📁 __dirname: ${__dirname}`);
console.log(`📁 process.cwd(): ${process.cwd()}`);

// Check if dist/index.js exists
import { existsSync } from 'fs';
const distPath = join(__dirname, 'dist', 'index.js');
console.log(`🔍 Looking for dist/index.js at: ${distPath}`);

if (!existsSync(distPath)) {
  console.error(`❌ dist/index.js not found at: ${distPath}`);
  console.error(`💡 Make sure to run 'npm run build' before deploying`);
  process.exit(1);
}

console.log(`✅ Found dist/index.js, starting server...`);

// Start the production server
const server = spawn('node', ['dist/index.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  process.exit(code);
}); 