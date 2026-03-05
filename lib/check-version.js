import https from 'https';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_DIR = path.join(os.homedir(), '.cache', 'oneclip');
const CACHE_FILE = path.join(CACHE_DIR, 'version-check.json');
const ONE_HOUR_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 3000;

function getLocalVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8'));
  return pkg.version;
}

function isNewer(latest, current) {
  const a = latest.split('.').map(Number);
  const b = current.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function writeCache(latestVersion) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ lastCheck: Date.now(), latestVersion }));
  } catch {
    // ignore write errors
  }
}

function fetchLatestVersion() {
  return new Promise((resolve, reject) => {
    const req = https.get('https://registry.npmjs.org/oneclip/latest', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data).version);
        } catch {
          reject(new Error('Failed to parse response'));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

export async function checkForUpdate() {
  try {
    const currentVersion = getLocalVersion();
    let latestVersion;

    const cache = readCache();
    if (cache && (Date.now() - cache.lastCheck) < ONE_HOUR_MS) {
      latestVersion = cache.latestVersion;
    } else {
      latestVersion = await fetchLatestVersion();
      writeCache(latestVersion);
    }

    if (isNewer(latestVersion, currentVersion)) {
      process.stderr.write(
        `\x1b[33mUpdate available: ${currentVersion} → ${latestVersion} — run "oneclip upgrade" to update\x1b[0m\n`
      );
    }
  } catch {
    // silently swallow all errors
  }
}
