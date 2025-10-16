#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AI Social Post Creator Backend in Production Mode...');

// Function to run command and handle errors
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function startProduction() {
  try {
    // 1. Generate Prisma Client
    console.log('📦 Generating Prisma Client...');
    await runCommand('npx', ['prisma', 'generate']);
    
    // 2. Run database migrations
    console.log('🗄️  Running database migrations...');
    try {
      await runCommand('npx', ['prisma', 'migrate', 'deploy']);
      console.log('✅ Database migrations completed successfully');
    } catch (error) {
      console.warn('⚠️  Database migration failed, continuing anyway:', error.message);
      console.log('💡 Make sure your DATABASE_URL is correct and the database is accessible');
    }

    // 3. Start the application
    console.log('🎯 Starting the application...');
    await runCommand('node', ['dist/index.js']);
    
  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

startProduction();
