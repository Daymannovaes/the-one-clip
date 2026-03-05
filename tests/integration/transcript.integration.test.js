import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'fs';
import { setupTmpDir, fixtures } from '../helpers/integration.js';
import { safelyTranscriptCommand } from '../../commands/transcript.js';

describe('transcript integration', () => {
  const { getOutput } = setupTmpDir();

  it('should generate an SRT file from video', async () => {
    const output = getOutput('transcript');
    await safelyTranscriptCommand(fixtures.video10s, { output });
    // whisper outputs to <output>.srt
    const srtPath = output + '.srt';
    expect(existsSync(srtPath)).toBe(true);
  }, 120_000);

  it('should produce non-empty SRT content', async () => {
    const output = getOutput('transcript-content');
    await safelyTranscriptCommand(fixtures.video10s, { output });
    const srtPath = output + '.srt';
    expect(existsSync(srtPath)).toBe(true);
    const size = statSync(srtPath).size;
    expect(size).toBeGreaterThan(0);
  }, 120_000);
});
