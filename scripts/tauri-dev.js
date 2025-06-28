
const { execSync } = require('child_process');

try {
  console.log('Starting Tauri development...');
  execSync('npx tauri dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting Tauri development:', error.message);
  process.exit(1);
}
