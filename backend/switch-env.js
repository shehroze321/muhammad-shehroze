#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const environments = {
  development: {
    NODE_ENV: 'development',
    DATABASE_URL: 'file:./dev.db',
    CLIENT_URL: 'http://localhost:3000',
    APP_URL: 'http://localhost:3000'
  },
  production: {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://postgres:password@containers-us-west-123.railway.app:6543/railway',
    CLIENT_URL: 'https://your-frontend-domain.com',
    APP_URL: 'https://your-frontend-domain.com'
  }
};

function switchEnvironment(env) {
  if (!environments[env]) {
    console.error(`❌ Unknown environment: ${env}`);
    console.log('Available environments:', Object.keys(environments).join(', '));
    process.exit(1);
  }

  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    process.exit(1);
  }

  // Read current .env
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update environment-specific variables
  Object.entries(environments[env]).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}="${value}"`);
    } else {
      envContent += `\n${key}="${value}"`;
    }
  });

  // Write back to .env
  fs.writeFileSync(envPath, envContent);
  
  console.log(`✅ Switched to ${env} environment`);
  console.log(`📋 Updated variables:`, Object.keys(environments[env]).join(', '));
  
  if (env === 'production') {
    console.log('\n🚨 IMPORTANT: Update these values in your .env file:');
    console.log('- DATABASE_URL: Replace with your Railway PostgreSQL URL');
    console.log('- CLIENT_URL: Replace with your frontend domain');
    console.log('- APP_URL: Replace with your app domain');
    console.log('- STRIPE_SECRET_KEY: Replace with live Stripe key');
    console.log('- OPENAI_API_KEY: Verify your OpenAI key');
  }
}

function showCurrentEnvironment() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const nodeEnv = envContent.match(/NODE_ENV="?([^"\n]+)"?/)?.[1] || 'unknown';
  const dbUrl = envContent.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1] || 'not set';
  
  console.log('📋 Current Environment:');
  console.log(`  NODE_ENV: ${nodeEnv}`);
  console.log(`  DATABASE_URL: ${dbUrl.includes('file:') ? 'SQLite (Development)' : 'PostgreSQL (Production)'}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'development':
  case 'dev':
    switchEnvironment('development');
    break;
  case 'production':
  case 'prod':
    switchEnvironment('production');
    break;
  case 'status':
  case 'show':
    showCurrentEnvironment();
    break;
  default:
    console.log('🔄 Environment Switcher');
    console.log('======================');
    console.log('');
    console.log('Usage:');
    console.log('  node switch-env.js dev        # Switch to development (SQLite)');
    console.log('  node switch-env.js prod       # Switch to production (PostgreSQL)');
    console.log('  node switch-env.js status     # Show current environment');
    console.log('');
    showCurrentEnvironment();
}
