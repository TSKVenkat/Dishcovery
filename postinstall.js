#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('Running postinstall script to approve Sharp build...');
  
  // Check if running in CI (like Vercel)
  const isCI = process.env.CI || process.env.VERCEL;
  
  if (isCI) {
    console.log('CI environment detected, skipping approval prompt');
    process.exit(0);
  }

  // Try to approve builds
  execSync('pnpm install sharp --ignore-scripts=false', { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('Sharp package successfully installed with build scripts');
} catch (error) {
  console.error('Error approving Sharp build:', error.message);
  // Don't fail the build if this doesn't work
  process.exit(0);
} 