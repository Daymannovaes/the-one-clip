import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { setupTmpDir, fixtures, countAudioStreams } from '../helpers/integration.js';
import { trackCommand } from '../../commands/track.js';

describe('track integration', () => {
  const { getOutput } = setupTmpDir();

  it('should select a single audio track from multi-track video', async () => {
    const output = getOutput('track-result.mkv');
    await trackCommand(fixtures.video30s, { track: 1, output });
    expect(existsSync(output)).toBe(true);
    const audioCount = await countAudioStreams(output);
    expect(audioCount).toBe(1);
  }, 30_000);

  it('should be able to select different tracks', async () => {
    const output = getOutput('track-3.mkv');
    await trackCommand(fixtures.video30s, { track: 3, output });
    expect(existsSync(output)).toBe(true);
    const audioCount = await countAudioStreams(output);
    expect(audioCount).toBe(1);
  }, 30_000);
});
