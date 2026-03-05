import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProcess, flattenTemplateCall } from '../helpers/mock-zx.js';

let mockDollar;
vi.mock('zx', () => ({
  get $() { return mockDollar; },
}));

// Mock fs.writeFileSync and fs.unlinkSync
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  };
});

const { joinCommand } = await import('../../commands/join.js');
const fs = await import('fs');

describe('joinCommand', () => {
  beforeEach(() => {
    mockDollar = vi.fn().mockReturnValue(createMockProcess());
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
  });

  it('should error when fewer than 2 files are provided', async () => {
    await expect(joinCommand(['one.mkv'], { output: 'out.mkv' }))
      .rejects.toThrow('process.exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('At least two files'));
  });

  it('should create a concat list with file entries', async () => {
    await joinCommand(['a.mkv', 'b.mkv'], { output: 'out.mkv' });
    const writeCall = fs.writeFileSync.mock.calls[0];
    const content = writeCall[1];
    expect(content).toContain("file 'a.mkv'");
    expect(content).toContain("file 'b.mkv'");
  });

  it('should use concat demuxer with codec copy', async () => {
    await joinCommand(['a.mkv', 'b.mkv'], { output: 'out.mkv' });
    const cmd = flattenTemplateCall(mockDollar.mock.calls[0]);
    expect(cmd).toContain('-f concat');
    expect(cmd).toContain('-codec copy');
  });

  it('should cleanup temp file after completion', async () => {
    await joinCommand(['a.mkv', 'b.mkv'], { output: 'out.mkv' });
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it('should handle 3+ files', async () => {
    await joinCommand(['a.mkv', 'b.mkv', 'c.mkv'], { output: 'out.mkv' });
    const content = fs.writeFileSync.mock.calls[0][1];
    expect(content).toContain("file 'a.mkv'");
    expect(content).toContain("file 'b.mkv'");
    expect(content).toContain("file 'c.mkv'");
  });
});
