import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(__dirname, '..', 'obs', 'rename-on-save.py');
const LABEL = 'com.oneclip.obs-renamer';
const PLIST_PATH = join(homedir(), 'Library', 'LaunchAgents', `${LABEL}.plist`);

function getPlist() {
  const python = execSync('python3 -c "import sys; print(sys.executable)"', { encoding: 'utf-8' }).trim();
  const scriptPath = resolve(SCRIPT);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${python}</string>
    <string>${scriptPath}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <false/>
  <key>StandardOutPath</key>
  <string>/tmp/obs-rename.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/obs-rename.log</string>
</dict>
</plist>`;
}

function install() {
  writeFileSync(PLIST_PATH, getPlist());
  console.log(`Wrote ${PLIST_PATH}`);
  try {
    execSync(`launchctl load ${PLIST_PATH}`, { stdio: 'inherit' });
    console.log('Launch Agent loaded. It will start on login (and right now).');
    console.log('Logs: /tmp/obs-rename.log');
  } catch {
    console.error('Failed to load Launch Agent. Try: launchctl load ' + PLIST_PATH);
  }
}

function uninstall() {
  try {
    execSync(`launchctl unload ${PLIST_PATH}`, { stdio: 'inherit' });
  } catch {
    // may already be unloaded
  }
  if (existsSync(PLIST_PATH)) {
    unlinkSync(PLIST_PATH);
    console.log(`Removed ${PLIST_PATH}`);
  }
  console.log('Launch Agent uninstalled.');
}

function status() {
  try {
    const out = execSync(`launchctl list ${LABEL}`, { encoding: 'utf-8' });
    console.log(`Launch Agent is loaded.\n`);
    console.log(out);
  } catch {
    console.log('Launch Agent is not loaded.');
    if (!existsSync(PLIST_PATH)) {
      console.log('Plist not found. Run --install first.');
    }
  }
}

export function obsRenameCommand(opts = {}) {
  if (opts.install) return install();
  if (opts.uninstall) return uninstall();
  if (opts.status) return status();

  // Default: run inline
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
