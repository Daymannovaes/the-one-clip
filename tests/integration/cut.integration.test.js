import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { setupTmpDir, fixtures, getDuration } from '../helpers/integration.js';
import { cutCommand } from '../../commands/cut.js';

describe('cut integration', () => {
  const { getOutput } = setupTmpDir();

  it('should cut a segment and produce output file', async () => {
    const output = getOutput('cut-result.mkv');
    await cutCommand(fixtures.video10s, { start: '00:00:00', end: '00:00:05', output });
    expect(existsSync(output)).toBe(true);
  }, 30_000);

  it('should produce output with approximately correct duration', async () => {
    const output = getOutput('cut-duration.mkv');
    await cutCommand(fixtures.video10s, { start: '00:00:00', end: '00:00:05', output });
    const duration = await getDuration(output);
    expect(duration).toBeGreaterThan(3);
    expect(duration).toBeLessThan(7);
  }, 30_000);

  it('should cut from start when only end is provided', async () => {
    const output = getOutput('cut-end-only.mkv');
    await cutCommand(fixtures.video10s, { end: '00:00:03', output });
    expect(existsSync(output)).toBe(true);
    const duration = await getDuration(output);
    expect(duration).toBeLessThan(5);
  }, 30_000);
});
