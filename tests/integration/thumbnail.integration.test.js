import { describe, it, expect } from 'vitest';
import { existsSync, statSync, copyFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { setupTmpDir, fixtures } from '../helpers/integration.js';
import { thumbnailCommand } from '../../commands/thumbnail.js';

describe('thumbnail integration', () => {
  const { getOutput, getTmpDir } = setupTmpDir();

  it('should generate a PNG thumbnail from an image', async () => {
    const output = getOutput('thumb.png');
    await thumbnailCommand(fixtures.sampleJpg, {
      title: 'Hello World',
      template: 'bold',
      output,
    });
    expect(existsSync(output)).toBe(true);
  }, 30_000);

  it('should produce a valid PNG file with non-zero size', async () => {
    const output = getOutput('thumb-size.png');
    await thumbnailCommand(fixtures.sampleJpg, {
      title: 'Test *Highlight*',
      template: 'bold',
      output,
    });
    const stat = statSync(output);
    expect(stat.size).toBeGreaterThan(1000);
  }, 30_000);

  it('should generate all template variants', async () => {
    // Copy sample.jpg to tmp dir so generated files land there
    const tmpJpg = join(getTmpDir(), 'sample.jpg');
    copyFileSync(fixtures.sampleJpg, tmpJpg);

    await thumbnailCommand(tmpJpg, {
      title: 'All Templates',
      template: 'all',
    });

    const pngs = readdirSync(getTmpDir()).filter(f => f.endsWith('.png'));
    expect(pngs.length).toBe(3); // bold, side, bottom
  }, 60_000);
});
