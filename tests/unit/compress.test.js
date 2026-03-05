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
    statSync: vi.fn().mockReturnValue({ size: 1000000 }),
  };
});

const { compressCommand } = await import('../../commands/compress.js');

describe('compressCommand', () => {
  beforeEach(() => {
    mockDollar = vi.fn().mockReturnValue(createMockProcess());
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
  });

  it('should error when output is missing', async () => {
    await expect(compressCommand('input.mkv', {}))
      .rejects.toThrow('process.exit');
  });

  it('should error for invalid speed option', async () => {
    await expect(compressCommand('input.mkv', { output: 'out.mkv', speed: 'invalid' }))
      .rejects.toThrow('process.exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid speed'));
  });

  it('should error for invalid codec option', async () => {
    await expect(compressCommand('input.mkv', { output: 'out.mkv', codec: 'vp9' }))
      .rejects.toThrow('process.exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Invalid codec'));
  });

  it('should use libx265 by default', async () => {
    await compressCommand('input.mkv', { output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('libx265');
  });

  it('should use libx264 when codec is h264', async () => {
    await compressCommand('input.mkv', { output: 'out.mkv', codec: 'h264' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('libx264');
  });

  it('should use CRF 28 when verygood is set', async () => {
    await compressCommand('input.mkv', { output: 'out.mkv', verygood: true });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-crf 28');
  });

  it('should use CRF 34 by default', async () => {
    await compressCommand('input.mkv', { output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-crf 34');
  });

  it('should use ultrafast speed by default', async () => {
    await compressCommand('input.mkv', { output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-preset ultrafast');
  });

  it('should use medium preset for slow speed', async () => {
    await compressCommand('input.mkv', { output: 'out.mkv', speed: 'slow' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-preset medium');
  });

  it('should add hvc1 tag for h265', async () => {
    await compressCommand('input.mkv', { output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-tag:v hvc1');
  });

  it('should not add hvc1 tag for h264', async () => {
    await compressCommand('input.mkv', { output: 'out.mkv', codec: 'h264' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).not.toContain('hvc1');
  });
});
