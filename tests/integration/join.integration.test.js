import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { setupTmpDir, fixtures, getDuration } from '../helpers/integration.js';
import { joinCommand } from '../../commands/join.js';

describe('join integration', () => {
  const { getOutput } = setupTmpDir();

  it('should join two videos into one', async () => {
    const output = getOutput('joined.mkv');
    await joinCommand([fixtures.video10s, fixtures.video90s], { output });
    expect(existsSync(output)).toBe(true);
  }, 30_000);

  it('should produce output with combined duration', async () => {
    const output = getOutput('joined-duration.mkv');
    await joinCommand([fixtures.video10s, fixtures.video90s], { output });
    const duration = await getDuration(output);
    // 10s + 90s = ~100s, allow tolerance
    expect(duration).toBeGreaterThan(90);
    expect(duration).toBeLessThan(110);
  }, 30_000);
});
