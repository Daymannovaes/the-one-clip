import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProcess, flattenTemplateCall } from '../helpers/mock-zx.js';

let mockDollar;
vi.mock('zx', () => ({
  get $() { return mockDollar; },
}));

const { trackCommand } = await import('../../commands/track.js');

describe('trackCommand', () => {
  beforeEach(() => {
    mockDollar = vi.fn().mockReturnValue(createMockProcess());
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
  });

  it('should error when track option is missing', async () => {
    await expect(trackCommand('input.mkv', { output: 'out.mkv' }))
      .rejects.toThrow('process.exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing required'));
  });

  it('should error when output option is missing', async () => {
    await expect(trackCommand('input.mkv', { track: 1 }))
      .rejects.toThrow('process.exit');
  });

  it('should convert 1-based track to 0-based index', async () => {
    await trackCommand('input.mkv', { track: 3, output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('0:a:2');
  });

  it('should map video and selected audio track', async () => {
    await trackCommand('input.mkv', { track: 1, output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-map 0:v');
    expect(cmd).toContain('-map 0:a:0');
    expect(cmd).toContain('-c copy');
  });
});
