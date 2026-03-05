import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProcess, flattenTemplateCall } from '../helpers/mock-zx.js';

let mockDollar;
vi.mock('zx', () => ({
  get $() { return mockDollar; },
}));

const { extractAudioCommand } = await import('../../commands/extract-audio.js');

describe('extractAudioCommand', () => {
  beforeEach(() => {
    mockDollar = vi.fn().mockReturnValue(createMockProcess());
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
  });

  it('should error when output is missing', async () => {
    await expect(extractAudioCommand('input.mkv', {}))
      .rejects.toThrow('process.exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing required'));
  });

  it('should extract audio with mono channel', async () => {
    await extractAudioCommand('input.mkv', { output: 'out.wav' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-ac 1');
  });

  it('should include frequency when specified', async () => {
    await extractAudioCommand('input.mkv', { output: 'out.wav', frequency: 16000 });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-ar');
    expect(cmd).toContain('16000');
  });

  it('should omit -ar when no frequency specified', async () => {
    await extractAudioCommand('input.mkv', { output: 'out.wav' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).not.toContain('-ar');
  });
});
