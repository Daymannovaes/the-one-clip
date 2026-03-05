import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProcess, flattenTemplateCall } from '../helpers/mock-zx.js';

let mockDollar;
vi.mock('zx', () => ({
  get $() { return mockDollar; },
}));

const { cutCommand } = await import('../../commands/cut.js');

describe('cutCommand', () => {
  beforeEach(() => {
    mockDollar = vi.fn().mockReturnValue(createMockProcess());
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
  });

  it('should error when both start and end are missing', async () => {
    await expect(cutCommand('input.mkv', { output: 'out.mkv' }))
      .rejects.toThrow('process.exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Missing required options'));
  });

  it('should default start to 00:00:00 when only end is provided', async () => {
    await cutCommand('input.mkv', { end: '00:00:05', output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('00:00:00');
    expect(cmd).toContain('00:00:05');
  });

  it('should use -to flag when end is provided', async () => {
    await cutCommand('input.mkv', { start: '00:00:01', end: '00:00:05', output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-ss');
    expect(cmd).toContain('-to');
    expect(cmd).toContain('00:00:01');
    expect(cmd).toContain('00:00:05');
  });

  it('should omit -to flag when only start is provided', async () => {
    await cutCommand('input.mkv', { start: '00:01:00', output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-ss');
    expect(cmd).toContain('00:01:00');
    expect(cmd).not.toContain('-to');
  });

  it('should use codec copy for fast cutting', async () => {
    await cutCommand('input.mkv', { start: '00:00:00', end: '00:00:10', output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-codec copy');
  });
});
