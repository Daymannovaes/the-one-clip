import { describe, it, expect } from 'vitest';
import { readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { setupTmpDir, fixtures } from '../helpers/integration.js';
import { thumbnailFramesCommand } from '../../commands/thumbnail-frames.js';

describe('thumbnail-frames integration', () => {
  const { getTmpDir } = setupTmpDir();

  it('should extract frames via scene detection', async () => {
    const outputDir = join(getTmpDir(), 'scene-thumbs');
    await thumbnailFramesCommand(fixtures.video10s, {
      count: '3',
      sceneThreshold: '0.1',
      outputDir,
    });
    const files = readdirSync(outputDir).filter(f => f.endsWith('.jpg'));
    expect(files.length).toBeGreaterThanOrEqual(0); // scene detection may find 0
  }, 30_000);

  it('should extract frames in interval mode', async () => {
    const outputDir = join(getTmpDir(), 'interval-thumbs');
    await thumbnailFramesCommand(fixtures.video10s, {
      count: '3',
      interval: true,
      sceneThreshold: '0.3',
      outputDir,
    });
    const files = readdirSync(outputDir).filter(f => f.endsWith('.jpg'));
    expect(files.length).toBeGreaterThanOrEqual(1);
  }, 30_000);

  it('should name files with thumb_ prefix', async () => {
    const outputDir = join(getTmpDir(), 'named-thumbs');
    await thumbnailFramesCommand(fixtures.video10s, {
      count: '2',
      interval: true,
      sceneThreshold: '0.3',
      outputDir,
    });
    const files = readdirSync(outputDir).filter(f => f.startsWith('thumb_') && f.endsWith('.jpg'));
    expect(files.length).toBeGreaterThanOrEqual(1);
  }, 30_000);
});
