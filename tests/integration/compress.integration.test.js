import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'fs';
import { setupTmpDir, fixtures } from '../helpers/integration.js';
import { compressCommand } from '../../commands/compress.js';

describe('compress integration', () => {
  const { getOutput } = setupTmpDir();

  it('should compress video and produce output', async () => {
    const output = getOutput('compressed.mkv');
    await compressCommand(fixtures.video10s, { output });
    expect(existsSync(output)).toBe(true);
  }, 120_000);

  it('should produce a smaller file than input', async () => {
    const output = getOutput('compressed-size.mkv');
    await compressCommand(fixtures.video10s, { output });
    const inputSize = statSync(fixtures.video10s).size;
    const outputSize = statSync(output).size;
    expect(outputSize).toBeLessThan(inputSize);
  }, 120_000);

  it('should work with h264 codec', async () => {
    const output = getOutput('compressed-h264.mkv');
    await compressCommand(fixtures.video10s, { output, codec: 'h264' });
    expect(existsSync(output)).toBe(true);
    const inputSize = statSync(fixtures.video10s).size;
    const outputSize = statSync(output).size;
    expect(outputSize).toBeLessThan(inputSize);
  }, 120_000);
});
