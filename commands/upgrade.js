import { $ } from 'zx';

export async function upgradeCommand() {
  console.log('Upgrading oneclip to latest version...');
  try {
    await $`npm install -g oneclip@latest`;
    console.log('Successfully upgraded oneclip!');
  } catch (err) {
    console.error('Failed to upgrade:', err.message);
    process.exit(1);
  }
}
