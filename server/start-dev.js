import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Avvio Nexus AI Suite: Backend (Porta 3001) + Frontend Web (Porta 5173)...');

const bk = spawn('node', ['src/app.js'], {
  cwd: path.resolve(rootDir, 'Trading BK'),
  shell: true,
  stdio: 'inherit'
});

const fr = spawn('npx', ['vite'], {
  cwd: path.resolve(rootDir, 'Trading FR'),
  shell: true,
  stdio: 'inherit'
});

process.on('SIGINT', () => {
  bk.kill();
  fr.kill();
  process.exit();
});
