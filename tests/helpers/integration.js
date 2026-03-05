import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import { $ } from 'zx';
import { beforeEach, afterEach } from 'vitest';

const FIXTURES_DIR = resolve(import.meta.dirname, '../../fixtures');

export const fixtures = {
  video10s: join(FIXTURES_DIR, 'small-video-10-sec.mkv'),
  video30s: join(FIXTURES_DIR, 'small-video-30-sec.mkv'),
  video90s: join(FIXTURES_DIR, 'small-video-90-sec.mkv'),
  sampleJpg: join(FIXTURES_DIR, 'sample.jpg'),
};

/**
 * Setup a temporary directory for integration test outputs.
 * Cleaned up automatically after each test.
 */
export function setupTmpDir() {
  let tmpDir;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'media-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  return {
    getTmpDir: () => tmpDir,
    getOutput: (filename) => join(tmpDir, filename),
  };
}

/**
 * Get media info via ffprobe (duration, streams, codec info).
 */
export async function getMediaInfo(filePath) {
  const result = await $`ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name -of json ${filePath}`;
  return JSON.parse(result.stdout);
}

/**
 * Get just the duration of a media file in seconds.
 */
export async function getDuration(filePath) {
  const info = await getMediaInfo(filePath);
  return parseFloat(info.format.duration);
}

/**
 * Count audio streams in a media file.
 */
export async function countAudioStreams(filePath) {
  const info = await getMediaInfo(filePath);
  return info.streams.filter(s => s.codec_type === 'audio').length;
}
