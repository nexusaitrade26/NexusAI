import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Avvio Nexus AI Desktop PC Suite: Backend (Porta 3001) + Frontend (Porta 5173)...');

const bk = spawn('node', ['src/app.js'], {
  cwd: path.resolve(__dirname, 'Trading BK'),
  shell: true,
  stdio: 'inherit'
});

const fr = spawn('npx', ['vite'], {
  cwd: path.resolve(__dirname, 'Trading FR'),
  shell: true,
  stdio: 'inherit'
});

process.on('SIGINT', () => {
  bk.kill();
  fr.kill();
  process.exit();
});
