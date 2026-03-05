import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProcess, flattenTemplateCall } from '../helpers/mock-zx.js';

let mockDollar;
let callCount;
vi.mock('zx', () => ({
  get $() { return mockDollar; },
}));

const { silenceRemoveCommand } = await import('../../commands/silence-remove.js');

describe('silenceRemoveCommand', () => {
  beforeEach(() => {
    callCount = 0;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
  });

  function setupMockWithSilence(silenceOutput, duration = '10.0') {
    mockDollar = vi.fn().mockImplementation((...args) => {
      callCount++;
      const cmd = flattenTemplateCall(args);
      if (cmd.includes('silencedetect')) {
        // First call: silence detection (returns nothrow-able result)
        const proc = createMockProcess(silenceOutput, '');
        proc.nothrow = () => Promise.resolve(proc);
        return proc.nothrow();
      } else if (cmd.includes('ffprobe')) {
        return createMockProcess(duration + '\n');
      } else {
        // filter_complex call
        return createMockProcess();
      }
    });
  }

  it('should error when output is missing', async () => {
    mockDollar = vi.fn();
    await expect(silenceRemoveCommand('input.mkv', {}))
      .rejects.toThrow('process.exit');
  });

  it('should copy file as-is when no silence is detected', async () => {
    setupMockWithSilence('no silence info here');
    await silenceRemoveCommand('input.mkv', { output: 'out.mkv' });
    // Should call silencedetect then cp (via $)
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No silence detected'));
  });

  it('should parse silence_start and silence_end from ffmpeg output', async () => {
    const silenceOutput = [
      '[silencedetect @ 0x123] silence_start: 2.5',
      '[silencedetect @ 0x123] silence_end: 4.0 | silence_duration: 1.5',
      '[silencedetect @ 0x123] silence_start: 7.0',
      '[silencedetect @ 0x123] silence_end: 8.5 | silence_duration: 1.5',
    ].join('\n');
    setupMockWithSilence(silenceOutput);

    await silenceRemoveCommand('input.mkv', { output: 'out.mkv' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('2 silent segment'));
  });

  it('should build trim filtergraph for non-silent segments', async () => {
    const silenceOutput = [
      '[silencedetect @ 0x123] silence_start: 3.0',
      '[silencedetect @ 0x123] silence_end: 5.0 | silence_duration: 2.0',
    ].join('\n');
    setupMockWithSilence(silenceOutput);

    await silenceRemoveCommand('input.mkv', { output: 'out.mkv' });

    // Find the filter_complex call
    const filterCall = mockDollar.mock.calls.find(call => {
      const cmd = flattenTemplateCall(call);
      return cmd.includes('filter_complex') || cmd.includes('-filter_complex');
    });
    expect(filterCall).toBeDefined();
    const cmd = flattenTemplateCall(filterCall);
    expect(cmd).toContain('trim=start=');
    expect(cmd).toContain('concat=');
  });

  it('should use default threshold of -30dB', async () => {
    const silenceOutput = '[silencedetect @ 0x123] silence_start: 1.0\n[silencedetect @ 0x123] silence_end: 2.0';
    setupMockWithSilence(silenceOutput);

    await silenceRemoveCommand('input.mkv', { output: 'out.mkv' });
    const firstCall = mockDollar.mock.calls[0];
    const cmd = flattenTemplateCall(firstCall);
    expect(cmd).toContain('-30dB');
  });

  it('should use custom threshold when specified', async () => {
    const silenceOutput = '[silencedetect @ 0x123] silence_start: 1.0\n[silencedetect @ 0x123] silence_end: 2.0';
    setupMockWithSilence(silenceOutput);

    await silenceRemoveCommand('input.mkv', { output: 'out.mkv', threshold: '-50dB' });
    const firstCall = mockDollar.mock.calls[0];
    const cmd = flattenTemplateCall(firstCall);
    expect(cmd).toContain('-50dB');
  });

  it('should merge short segments', async () => {
    // Create many short segments that should be merged
    const silenceOutput = [
      'silence_start: 1.0', 'silence_end: 1.5',
      'silence_start: 3.0', 'silence_end: 3.5',
      'silence_start: 5.0', 'silence_end: 5.5',
      'silence_start: 7.0', 'silence_end: 7.5',
    ].join('\n');
    setupMockWithSilence(silenceOutput);

    await silenceRemoveCommand('input.mkv', { output: 'out.mkv', minSegment: '3' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Merged short segments'));
  });

  it('should handle entire file being silent', async () => {
    const silenceOutput = 'silence_start: 0.0\nsilence_end: 10.0';
    setupMockWithSilence(silenceOutput);

    await silenceRemoveCommand('input.mkv', { output: 'out.mkv' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Entire file is silent'));
  });
});
