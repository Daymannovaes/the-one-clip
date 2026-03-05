import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TONE_FILE = path.resolve(__dirname, '..', 'tones', 'chime.wav');
/**
 * Play a notification sound.
 * Uses afplay (macOS) or aplay (Linux). Fails silently if audio is unavailable.
 */
export function playNotification() {
  if (!fs.existsSync(TONE_FILE)) return Promise.resolve();

  const cmd = process.platform === 'darwin' ? 'afplay' : 'aplay';
  return new Promise((resolve) => {
    exec(`${cmd} "${TONE_FILE}"`, () => resolve());
  });
}
