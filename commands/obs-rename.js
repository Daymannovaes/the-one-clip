import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'obs', 'rename-on-save.py');

export function obsRenameCommand() {
  const child = spawn('python3', [SCRIPT], {
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    console.error(`Failed to start OBS rename listener: ${err.message}`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}
