import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProcess, flattenTemplateCall } from '../helpers/mock-zx.js';

let mockDollar;
vi.mock('zx', () => ({
  get $() { return mockDollar; },
}));

const { removeTrackCommand } = await import('../../commands/remove-track.js');

describe('removeTrackCommand', () => {
  beforeEach(() => {
    mockDollar = vi.fn().mockReturnValue(createMockProcess());
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
  });

  it('should error when track option is missing', async () => {
    await expect(removeTrackCommand('input.mkv', { output: 'out.mkv' }))
      .rejects.toThrow('process.exit');
  });

  it('should use negative map to exclude the track', async () => {
    await removeTrackCommand('input.mkv', { track: 2, output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-map 0:v');
    expect(cmd).toContain('-map 0:a');
    expect(cmd).toContain('-map -0:a:1');
  });

  it('should convert 1-based to 0-based index', async () => {
    await removeTrackCommand('input.mkv', { track: 5, output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-map -0:a:4');
  });
});
