import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { setupTmpDir, fixtures, getMediaInfo } from '../helpers/integration.js';
import { extractAudioCommand } from '../../commands/extract-audio.js';

describe('extract-audio integration', () => {
  const { getOutput } = setupTmpDir();

  it('should extract audio to WAV file', async () => {
    const output = getOutput('audio.wav');
    await extractAudioCommand(fixtures.video10s, { output });
    expect(existsSync(output)).toBe(true);
  }, 30_000);

  it('should produce a file with audio stream', async () => {
    const output = getOutput('audio-check.wav');
    await extractAudioCommand(fixtures.video10s, { output });
    const info = await getMediaInfo(output);
    const audioStreams = info.streams.filter(s => s.codec_type === 'audio');
    expect(audioStreams.length).toBeGreaterThanOrEqual(1);
  }, 30_000);
});
