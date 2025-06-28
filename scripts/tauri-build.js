
const { execSync } = require('child_process');

try {
  console.log('Building Tauri application...');
  execSync('npx tauri build', { stdio: 'inherit' });
} catch (error) {
  console.error('Error building Tauri application:', error.message);
  process.exit(1);
}
