import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { setupTmpDir, fixtures } from '../helpers/integration.js';
import { silenceRemoveCommand } from '../../commands/silence-remove.js';

describe('silence-remove integration', () => {
  const { getOutput } = setupTmpDir();

  it('should complete without error', async () => {
    const output = getOutput('silence-removed.mkv');
    await silenceRemoveCommand(fixtures.video10s, { output });
    expect(existsSync(output)).toBe(true);
  }, 60_000);

  it('should produce output file', async () => {
    const output = getOutput('silence-removed-2.mkv');
    await silenceRemoveCommand(fixtures.video10s, {
      output,
      threshold: '-20dB',
      duration: '0.3',
    });
    expect(existsSync(output)).toBe(true);
  }, 60_000);
});
