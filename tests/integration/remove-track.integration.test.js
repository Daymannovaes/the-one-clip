import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { setupTmpDir, fixtures, countAudioStreams } from '../helpers/integration.js';
import { removeTrackCommand } from '../../commands/remove-track.js';

describe('remove-track integration', () => {
  const { getOutput } = setupTmpDir();

  it('should remove one audio track from multi-track video', async () => {
    const output = getOutput('remove-track-result.mkv');
    await removeTrackCommand(fixtures.video30s, { track: 1, output });
    expect(existsSync(output)).toBe(true);
    const audioCount = await countAudioStreams(output);
    expect(audioCount).toBe(5);
  }, 30_000);

  it('should remove a different track', async () => {
    const output = getOutput('remove-track-3.mkv');
    await removeTrackCommand(fixtures.video30s, { track: 3, output });
    expect(existsSync(output)).toBe(true);
    const audioCount = await countAudioStreams(output);
    expect(audioCount).toBe(5);
  }, 30_000);
});
