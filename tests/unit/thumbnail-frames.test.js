import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProcess, flattenTemplateCall } from '../helpers/mock-zx.js';

let mockDollar;
vi.mock('zx', () => ({
  get $() { return mockDollar; },
}));

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      mkdirSync: vi.fn(),
      readdirSync: vi.fn().mockReturnValue(['thumb_0001.jpg', 'thumb_0002.jpg']),
    },
    mkdirSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue(['thumb_0001.jpg', 'thumb_0002.jpg']),
  };
});

const { thumbnailFramesCommand } = await import('../../commands/thumbnail-frames.js');

describe('thumbnailFramesCommand', () => {
  beforeEach(() => {
    mockDollar = vi.fn().mockReturnValue(createMockProcess('10.0\n'));
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
  });

  it('should use scene detection by default', async () => {
    await thumbnailFramesCommand('input.mkv', { count: '5', sceneThreshold: '0.3' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('select=gt(scene');
    expect(cmd).toContain('0.3');
  });

  it('should use fps filter in interval mode', async () => {
    await thumbnailFramesCommand('input.mkv', {
      count: '5',
      interval: true,
      sceneThreshold: '0.3',
    });
    // First call is ffprobe, second is ffmpeg
    const ffmpegCall = mockDollar.mock.calls[1];
    const cmd = flattenTemplateCall(ffmpegCall);
    expect(cmd).toContain('fps=');
  });

  it('should calculate correct fps for interval mode', async () => {
    // Duration is 10s, count is 4 → fps = 0.4
    mockDollar = vi.fn().mockImplementation((...args) => {
      return createMockProcess('10.0\n');
    });
    await thumbnailFramesCommand('input.mkv', {
      count: '4',
      interval: true,
      sceneThreshold: '0.3',
    });
    const ffmpegCall = mockDollar.mock.calls[1];
    const cmd = flattenTemplateCall(ffmpegCall);
    expect(cmd).toContain('fps=0.4');
  });

  it('should default to count of 5', async () => {
    await thumbnailFramesCommand('input.mkv', { sceneThreshold: '0.3' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-frames:v 5');
  });

  it('should create output directory', async () => {
    const fs = await import('fs');
    await thumbnailFramesCommand('input.mkv', { count: '3', sceneThreshold: '0.3' });
    expect(fs.default.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('input_thumbnails'),
      { recursive: true },
    );
  });
});
